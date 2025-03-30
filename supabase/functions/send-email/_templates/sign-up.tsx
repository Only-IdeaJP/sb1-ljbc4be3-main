// supabase/functions/send-email/_templates/sign-up.tsx

import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface SignUpEmailProps {
    supabase_url: string
    email_action_type: string
    redirect_to: string
    token_hash: string
    token: string
}

export const SignUpEmail = ({
    token,
    supabase_url,
    email_action_type,
    redirect_to,
    token_hash,
}: SignUpEmailProps) => {
    // 確認用のURL
    const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    // 正しいロゴ画像のURL
    const logoUrl = "https://mrpapermanagement.com/images/pelican-logo2.png";

    // 現在の日付を取得（日本語形式）
    const currentDate = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Html>
            <Head>
                {/* メタタグの追加 */}
                <meta name="x-apple-disable-message-reformatting" content="true" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Preview>【ペーパー管理くん】アカウント登録のご確認 - ご登録ありがとうございます</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* ロゴ部分 */}
                    <Section style={logoContainer}>
                        <Img
                            src={logoUrl}
                            width="60"
                            height="60"
                            alt="ペーパー管理くん"
                            style={logo}
                        />
                        <Heading style={title}>ペーパー管理くん</Heading>
                    </Section>

                    <Section style={section}>
                        <Text style={dateText}>{currentDate}</Text>
                        <Heading style={h1}>アカウント確認のご案内</Heading>
                        <Text style={text}>
                            この度は、ペーパー管理くんにご登録いただき誠にありがとうございます。
                        </Text>
                        <Text style={text}>
                            下記のボタンをクリックして、アカウント登録を完了させてください。
                            アカウント確認後、すべての機能をご利用いただけます。
                        </Text>

                        <Button
                            href={confirmationUrl}
                            style={button}
                        >
                            アカウントを確認する
                        </Button>

                        <Text style={noteText}>
                            もしボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください：
                        </Text>
                        <Text style={linkText}>
                            <Link
                                href={confirmationUrl}
                                style={link}
                            >
                                {confirmationUrl}
                            </Link>
                        </Text>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            このメールは自動送信されています。ご不明点がございましたら、
                            <Link href="https://mrpapermanagement.com/contact" style={link}>お問い合わせフォーム</Link>
                            よりご連絡ください。
                        </Text>
                        <Text style={footerText}>
                            このメールに心当たりがない場合は、このメールを無視していただいて構いません。
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={addressText}>
                            株式会社すみれAIスクール<br />
                            〒108-0072 東京都港区白金1-17-1<br />
                            <Link href="https://mrpapermanagement.com" style={link}>https://mrpapermanagement.com</Link>
                        </Text>
                        <Text style={footerCompany}>
                            © {new Date().getFullYear()} ペーパー管理くん | Sumire AI School
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

export default SignUpEmail

// スタイル定義
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
    padding: '20px 0',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0',
    borderRadius: '4px',
    maxWidth: '600px',
    marginBottom: '24px',
    border: '1px solid #e6ebf1',
}

const logoContainer = {
    textAlign: 'center' as const,
    padding: '20px',
}

const logo = {
    margin: '0 auto',
}

const title = {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '10px 0',
    color: '#4338ca',
}

const section = {
    padding: '0 24px',
}

const dateText = {
    textAlign: 'right' as const,
    color: '#666',
    fontSize: '14px',
    marginBottom: '20px',
}

const h1 = {
    color: '#333',
    fontSize: '26px',
    fontWeight: 'bold',
    margin: '30px 0',
    padding: '0',
    textAlign: 'center' as const,
}

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center' as const,
    margin: '16px 0',
}

const button = {
    backgroundColor: '#4338ca',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '270px',
    padding: '14px 7px',
    margin: '30px auto',
}

const noteText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '21px',
    marginTop: '32px',
    textAlign: 'center' as const,
}

const linkText = {
    fontSize: '14px',
    lineHeight: '21px',
    margin: '12px 0 32px',
    textAlign: 'center' as const,
    wordBreak: 'break-all' as const,
}

const link = {
    color: '#4338ca',
    textDecoration: 'underline',
}

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
}

const footerText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '21px',
    textAlign: 'center' as const,
    margin: '10px 0',
}

const footer = {
    textAlign: 'center' as const,
    padding: '0 24px 20px',
}

const addressText = {
    color: '#8898aa',
    fontSize: '13px',
    lineHeight: '18px',
    textAlign: 'center' as const,
    margin: '20px 0 10px',
}

const footerCompany = {
    color: '#8898aa',
    fontSize: '12px',
    marginTop: '12px',
}