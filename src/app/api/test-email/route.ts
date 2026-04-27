import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

if (!process.env.EMAIL_TRIGGER_KEY) {
  return NextResponse.json(
    { error: 'Missing EMAIL_TRIGGER_KEY on Vercel' },
    { status: 500 }
  )
}

if (!key) {
  return NextResponse.json(
    { error: 'Missing key in URL' },
    { status: 401 }
  )
}

if (key.trim() !== process.env.EMAIL_TRIGGER_KEY.trim()) {
  return NextResponse.json(
    {
      error: 'Unauthorized',
      urlKeyLength: key.length,
      envKeyLength: process.env.EMAIL_TRIGGER_KEY.length
    },
    { status: 401 }
  )
}
  const { data: users, error } = await supabase
    .from('profiles')
    .select('email')

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  const html = `
<p><strong>🇧🇷 Português</strong></p>
<p>Oi,</p>
<p>O Neuronaut te ajuda a tomar decisões melhores sobre trabalho, dinheiro e próximos passos — de forma simples e direta.</p>
<p>Estamos lançando novas funções, e por enquanto ainda está gratuito.</p>
<p>Se você está gostando, compartilhe com amigos e familiares.</p>

<p><strong>Abra o Neuronaut:</strong></p>
<p>
<a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">📱 Android</a> |
<a href="https://apps.apple.com/us/app/neuronaut/id6758070764">🍎 iPhone</a>
</p>

<p><strong>Outros apps da Arison8:</strong></p>
<ul>
  <li><strong>READMI</strong> — feedback direto sobre imagem, presença e primeira impressão.</li>
  <li><strong>Moo Fridge</strong> — organização simples para geladeira, comida e rotina.</li>
  <li><strong>Don’t Do It</strong> — um app direto para ajudar você a pausar antes de tomar decisões impulsivas.</li>
</ul>

<hr/>

<p><strong>🇺🇸 English</strong></p>
<p>Hey,</p>
<p>Neuronaut helps you make better decisions about work, money, and your next steps — fast and clear.</p>
<p>New features are being added, and it’s still free for now.</p>
<p>If you’re enjoying it, share it with friends and family.</p>

<p><strong>Open Neuronaut:</strong></p>
<p>
<a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">📱 Android</a> |
<a href="https://apps.apple.com/us/app/neuronaut/id6758070764">🍎 iPhone</a>
</p>

<p><strong>Other apps by Arison8:</strong></p>
<ul>
  <li><strong>READMI</strong> — direct feedback on image, presence, and first impression.</li>
  <li><strong>Moo Fridge</strong> — simple organization for your fridge, food, and routine.</li>
  <li><strong>Don’t Do It</strong> — a direct app to help you pause before impulsive decisions.</li>
</ul>

<hr/>

<p><strong>🇪🇸 Español</strong></p>
<p>Hola,</p>
<p>Neuronaut te ayuda a tomar mejores decisiones sobre trabajo, dinero y tus próximos pasos.</p>
<p>Se están agregando nuevas funciones y todavía es gratis por ahora.</p>
<p>Si te gusta, compártelo con amigos y familia.</p>

<p><strong>Abre Neuronaut:</strong></p>
<p>
<a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">📱 Android</a> |
<a href="https://apps.apple.com/us/app/neuronaut/id6758070764">🍎 iPhone</a>
</p>

<p><strong>Otros apps de Arison8:</strong></p>
<ul>
  <li><strong>READMI</strong> — feedback directo sobre imagen, presencia y primera impresión.</li>
  <li><strong>Moo Fridge</strong> — organización simple para tu nevera, comida y rutina.</li>
  <li><strong>Don’t Do It</strong> — una app directa para ayudarte a pausar antes de decisiones impulsivas.</li>
</ul>

<hr/>

<p><strong>🇫🇷 Français</strong></p>
<p>Salut,</p>
<p>Neuronaut vous aide à prendre de meilleures décisions sur le travail, l’argent et vos prochaines étapes.</p>
<p>De nouvelles fonctionnalités arrivent, et c’est encore gratuit pour le moment.</p>
<p>Si vous aimez l’app, partagez-la avec vos proches.</p>

<p><strong>Ouvrir Neuronaut :</strong></p>
<p>
<a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">📱 Android</a> |
<a href="https://apps.apple.com/us/app/neuronaut/id6758070764">🍎 iPhone</a>
</p>

<p><strong>Autres apps par Arison8 :</strong></p>
<ul>
  <li><strong>READMI</strong> — feedback direct sur l’image, la présence et la première impression.</li>
  <li><strong>Moo Fridge</strong> — organisation simple pour le frigo, la nourriture et la routine.</li>
  <li><strong>Don’t Do It</strong> — une app directe pour vous aider à faire une pause avant les décisions impulsives.</li>
</ul>
`

  let sent = 0
  const failed: string[] = []

  for (const user of users ?? []) {
    if (!user.email) continue

    try {
      await resend.emails.send({
        from: 'Neuronaut <support@arison8.com>',
        to: user.email,
        subject: 'Neuronaut is still free — plus more apps by Arison8',
        html,
      })
      sent++
    } catch {
      failed.push(user.email)
    }
  }

  return NextResponse.json({
    total: users?.length ?? 0,
    sent,
    failed: failed.length,
    failedEmails: failed,
  })
}