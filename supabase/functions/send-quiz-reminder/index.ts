import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  studentEmail: string;
  studentName: string;
  quizName: string;
  quizId: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentEmail, studentName, quizName, quizId }: ReminderRequest = await req.json();

    console.log("Sending reminder to:", studentEmail, "for quiz:", quizName);

    const emailResponse = await resend.emails.send({
      from: "FALA Education <onboarding@resend.dev>",
      to: [studentEmail],
      subject: `Lembrete: Quiz "${quizName}" aguardando | Reminder: Quiz "${quizName}" pending`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B35;">Olá, ${studentName}!</h2>
          <p>Este é um lembrete amigável de que você ainda não completou o quiz:</p>
          <h3 style="color: #004E89;">${quizName}</h3>
          <p>Acesse a plataforma FALA para completar este quiz quando puder.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;" />
          <h2 style="color: #FF6B35;">Hello, ${studentName}!</h2>
          <p>This is a friendly reminder that you haven't completed the quiz yet:</p>
          <h3 style="color: #004E89;">${quizName}</h3>
          <p>Please access the FALA platform to complete this quiz when you can.</p>
          <br />
          <p style="color: #666; font-size: 12px;">
            Atenciosamente, / Best regards,<br />
            <strong>Equipe FALA Education / FALA Education Team</strong>
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-quiz-reminder function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
