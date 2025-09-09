import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the session/user
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user's profile to get legacy_id
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_legacy_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const { name, objective, prompt, totalQuestions } = await req.json();

    console.log('Generating quiz with Gemini API for:', { name, objective, totalQuestions });

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create quiz in database first
    const { data: quiz, error: quizError } = await supabaseClient
      .from('Quizzes')
      .insert({
        name,
        objective,
        prompt,
        total_questions: totalQuestions,
        user_id: profile.user_legacy_id,
      })
      .select()
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      throw new Error('Failed to create quiz');
    }

    console.log('Quiz created:', quiz);

    // Generate questions using Gemini API
    const geminiPrompt = `Crie ${totalQuestions} perguntas de múltipla escolha sobre: ${prompt}

Objetivo: ${objective}

Para cada pergunta, forneça:
1. A pergunta
2. 4 opções de resposta (A, B, C, D)
3. Indique qual é a resposta correta

Formato de resposta esperado (JSON):
{
  "questions": [
    {
      "question": "Pergunta aqui?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correct": 0
    }
  ]
}

Onde "correct" é o índice da resposta correta (0, 1, 2 ou 3).`;

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: geminiPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', geminiData);

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }

    const questionsData = JSON.parse(jsonMatch[0]);
    console.log('Parsed questions:', questionsData);

    // Insert questions and answers into database
    for (let i = 0; i < questionsData.questions.length; i++) {
      const questionData = questionsData.questions[i];
      
      // Insert question
      const { data: question, error: questionError } = await supabaseClient
        .from('Questions')
        .insert({
          quiz_id: quiz.quiz_id.toString(),
          question_text: questionData.question,
        })
        .select()
        .single();

      if (questionError) {
        console.error('Error creating question:', questionError);
        continue;
      }

      // Insert answers
      let correctAnswerId = null;
      for (let j = 0; j < questionData.options.length; j++) {
        const isCorrect = j === questionData.correct;
        
        const { data: answer, error: answerError } = await supabaseClient
          .from('Answers')
          .insert({
            question_id: question.question_id,
            answer_text: questionData.options[j],
            is_correct: isCorrect,
          })
          .select()
          .single();

        if (answerError) {
          console.error('Error creating answer:', answerError);
          continue;
        }

        if (isCorrect) {
          correctAnswerId = answer.answer_id;
        }
      }

      // Update question with correct answer ID
      if (correctAnswerId) {
        await supabaseClient
          .from('Questions')
          .update({ correct_answer_id: correctAnswerId })
          .eq('question_id', question.question_id);
      }
    }

    console.log('Quiz generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        quizId: quiz.quiz_id,
        message: 'Quiz gerado com sucesso!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});