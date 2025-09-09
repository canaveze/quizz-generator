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
      .maybeSingle();

    if (!profile || !profile.user_legacy_id) {
      throw new Error('User profile not found or user_legacy_id is null');
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
    const geminiPrompt = `Crie exatamente ${totalQuestions} perguntas de múltipla escolha sobre o tema: "${prompt}"

Objetivo do quiz: ${objective}

IMPORTANTE: Responda APENAS com um JSON válido no seguinte formato:

{
  "questions": [
    {
      "question": "Qual é a pergunta?",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correct": 0
    }
  ]
}

Regras:
- Crie exatamente ${totalQuestions} perguntas
- Cada pergunta deve ter exatamente 4 opções
- "correct" deve ser o índice da resposta correta (0, 1, 2 ou 3)
- Use apenas texto em português
- Não adicione texto extra fora do JSON`;

    console.log('Calling Gemini API with prompt length:', geminiPrompt.length);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', JSON.stringify(geminiData, null, 2));

    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);
    
    // Clean and extract JSON from the response
    let jsonText = generatedText.trim();
    
    // Remove any markdown formatting if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find JSON in the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Could not extract valid JSON from Gemini response. Raw text: ${generatedText}`);
    }

    let questionsData;
    try {
      questionsData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse JSON from Gemini response: ${parseError.message}`);
    }
    
    console.log('Parsed questions:', questionsData);

    // Validate the response structure
    if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid questions structure in Gemini response');
    }

    // Insert questions and answers into database
    for (let i = 0; i < questionsData.questions.length; i++) {
      const questionData = questionsData.questions[i];
      
      // Insert question
      const { data: question, error: questionError } = await supabaseClient
        .from('Questions')
        .insert({
          quiz_id: quiz.quiz_id,
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