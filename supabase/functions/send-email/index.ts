import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { PasswordResetEmail } from './_templates/password-reset.tsx'
import { SignUpEmail } from './_templates/sign-up.tsx'

const resend = new Resend(Deno.env.get('VITE_RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('不正なリクエストです', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  const wh = new Webhook(hookSecret)

  try {
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
        token_new: string
        token_hash_new: string
      }
    }

    // メールタイプに基づいて適切なテンプレートとサブジェクトを選択
    let emailHtml: string
    let emailSubject: string

    if (email_action_type === 'recovery') {
      // パスワードリセットのメール
      emailHtml = await renderAsync(
        React.createElement(PasswordResetEmail, {
          supabase_url: Deno.env.get('VITE_SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      )
      emailSubject = 'ペーパー管理くん - パスワードリセットのご案内'
    } else {
      // サインアップ・確認メール
      emailHtml = await renderAsync(
        React.createElement(SignUpEmail, {
          supabase_url: Deno.env.get('VITE_SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
        })
      )
      emailSubject = 'ペーパー管理くんへようこそ！アカウント確認のご案内'
    }

    console.log(`メール送信: ${email_action_type} - 送信先: ${user.email}`)

    // メール送信
    const { error } = await resend.emails.send({
      from: "team@only-idea.com",
      to: [user.email],
      subject: emailSubject,
      html: emailHtml,
    })

    if (error) {
      console.error('メール送信エラー:', error)
      throw error
    }

    console.log(`メール送信成功: ${email_action_type} - 送信先: ${user.email}`)

  } catch (error) {
    console.error('エラー詳細:', error)
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
    )
  }

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'application/json')

  return new Response(JSON.stringify({
    status: 'success',
    message: 'メールが正常に送信されました'
  }), {
    status: 200,
    headers: responseHeaders,
  })
})