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

interface PasswordResetEmailProps {
    supabase_url: string
    email_action_type: string
    redirect_to: string
    token_hash: string
    token: string
}

export const PasswordResetEmail = ({
    token,
    supabase_url,
    email_action_type,
    redirect_to,
    token_hash,
}: PasswordResetEmailProps) => {
    // リセットリンクのURL
    const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`;

    return (
        <Html>
            <Head />
            <Preview>ペーパー管理くん - パスワードリセットのご案内</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* ロゴ部分 */}
                    <Section style={logoContainer}>
                        <Img
                            src="https://i.ibb.co/K9RBnPL/pelican-logo2.png"
                            width="60"
                            height="60"
                            alt="ペーパー管理くん"
                            style={logo}
                        />
                        <Heading style={title}>ペーパー管理くん</Heading>
                    </Section>

                    <Section style={section}>
                        <Heading style={h1}>パスワードリセットのご案内</Heading>
                        <Text style={text}>
                            パスワードのリセットをリクエストいただきました。以下のボタンをクリックして、新しいパスワードを設定してください。
                        </Text>

                        <Button
                            href={resetUrl}
                            style={button}
                        >
                            パスワードを再設定する
                        </Button>

                        <Text style={noteText}>
                            もしボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください：
                        </Text>
                        <Text style={linkText}>
                            <Link
                                href={resetUrl}
                                style={link}
                            >
                                {resetUrl}
                            </Link>
                        </Text>

                        <Text style={noteText}>
                            または、こちらの一時的なコードを使用してください：
                        </Text>
                        <Text style={codeText}>
                            <code style={code}>{token}</code>
                        </Text>

                        <Hr style={hr} />

                        <Text style={footerText}>
                            このパスワードのリセットをリクエストしていない場合は、このメールを無視していただいて構いません。あなたのアカウントは安全です。
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerCompany}>
                            © {new Date().getFullYear()} ペーパー管理くん | Sumire AI School
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

export default PasswordResetEmail

// スタイル定義
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0',
    borderRadius: '4px',
    maxWidth: '600px',
    marginBottom: '64px',
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
    margin: '24px 0',
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
    margin: '0 auto',
}

const noteText = {
    color: '#666',
    fontSize: '14px',
    lineHeight: '21px',
    marginTop: '24px',
    textAlign: 'center' as const,
}

const linkText = {
    fontSize: '14px',
    lineHeight: '21px',
    margin: '12px 0',
    textAlign: 'center' as const,
    wordBreak: 'break-all' as const,
}

const link = {
    color: '#4338ca',
    textDecoration: 'underline',
}

const codeText = {
    textAlign: 'center' as const,
    margin: '16px 0 24px',
}

const code = {
    display: 'inline-block',
    padding: '16px 4.5%',
    width: '70%',
    backgroundColor: '#f4f4f9',
    borderRadius: '5px',
    border: '1px solid #eee',
    color: '#333',
    fontSize: '15px',
    textAlign: 'center' as const,
    fontFamily: 'monospace',
    letterSpacing: '2px',
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
}

const footer = {
    textAlign: 'center' as const,
    padding: '0 24px',
}

const footerCompany = {
    color: '#8898aa',
    fontSize: '12px',
    marginTop: '12px',
}