import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { PasswordResetEmail } from './_templates/password-reset.tsx'
import { SignUpEmail } from './_templates/sign-up.tsx'

const resend = new Resend(Deno.env.get('VITE_RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

// サポートされているメールアクションタイプ
const EMAIL_ACTIONS = {
  SIGNUP: 'signup',
  RECOVERY: 'recovery',
  INVITE: 'invite', // 未実装だが将来のため
  MAGIC_LINK: 'magiclink', // 未実装だが将来のため
}

// 環境によるリダイレクトURL設定
function getRedirectUrl(action: string, providedRedirect?: string): string {
  const baseUrl = 'https://sb1-ljbc4be3-main-pacgcfbfh-onlyideas-projects.vercel.app'; // デフォルトのアプリURL

  // 提供されたリダイレクトURLがあれば、それを優先
  if (providedRedirect) {
    return providedRedirect;
  }

  // アクションタイプに基づいてリダイレクト先を決定
  switch (action) {
    case EMAIL_ACTIONS.SIGNUP:
      return `${baseUrl}/confirm-success`;
    case EMAIL_ACTIONS.RECOVERY:
      return `${baseUrl}/reset-password`;
    default:
      return baseUrl;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('不正なリクエストです', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  try {
    // ペイロードを検証
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        id?: string;
      }
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
        token_new?: string;
        token_hash_new?: string;
      }
    }

    // Supabase URL を環境変数から取得
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') ?? '';

    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not defined');
    }

    // 適切なリダイレクト先を確保
    const finalRedirectTo = getRedirectUrl(email_action_type);
    console.log(`リダイレクト先: ${finalRedirectTo}`);

    console.log(`メール送信リクエスト: ${email_action_type} - 送信先: ${user.email}`);

    // メールタイプに基づいて適切なテンプレートとサブジェクトを選択
    let emailHtml: string;
    let emailSubject: string;

    switch (email_action_type) {
      case EMAIL_ACTIONS.RECOVERY:
        // パスワードリセットのメール
        emailHtml = await renderAsync(
          React.createElement(PasswordResetEmail, {
            supabase_url: supabaseUrl,
            token,
            token_hash,
            redirect_to: finalRedirectTo,
            email_action_type,
          })
        );
        emailSubject = 'ペーパー管理くん - パスワードリセットのご案内';
        console.log('パスワードリセットメールのテンプレートをレンダリングしました');
        break;

      case EMAIL_ACTIONS.SIGNUP:
        // サインアップ・確認メール
        emailHtml = await renderAsync(
          React.createElement(SignUpEmail, {
            supabase_url: supabaseUrl,
            token,
            token_hash,
            redirect_to: finalRedirectTo,
            email_action_type,
          })
        );
        emailSubject = 'ペーパー管理くんへようこそ！アカウント確認のご案内';
        console.log('アカウント確認メールのテンプレートをレンダリングしました');
        break;

      default:
        // その他のアクションタイプの場合は、デフォルトでサインアップメールを使用
        console.log(`未知のアクションタイプです: ${email_action_type}, サインアップメールとして処理します`);
        emailHtml = await renderAsync(
          React.createElement(SignUpEmail, {
            supabase_url: supabaseUrl,
            token,
            token_hash,
            redirect_to: finalRedirectTo,
            email_action_type,
          })
        );
        emailSubject = 'ペーパー管理くんへようこそ！アカウント確認のご案内';
    }

    // メール送信
    console.log(`メール送信中: ${email_action_type} - 送信先: ${user.email}`);
    const { error } = await resend.emails.send({
      from: "ペーパー管理くん <team@only-idea.com>",
      to: [user.email],
      subject: emailSubject,
      html: emailHtml,
    });

    if (error) {
      console.error('メール送信エラー:', error);
      throw error;
    }

    console.log(`メール送信成功: ${email_action_type} - 送信先: ${user.email}`);

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'メールが正常に送信されました',
        action: email_action_type,
        recipient: user.email,
        redirectTo: finalRedirectTo
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('エラー詳細:', error);

    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || 'メール送信中に予期せぬエラーが発生しました',
        },
      }),
      {
        status: error.code || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});