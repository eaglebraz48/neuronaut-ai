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

<p>O Dia das Mães está chegando — e às vezes a parte mais difícil não é comprar um presente… é escolher o presente certo.</p>

<p>O Zolarus ajuda você a encontrar ideias de presentes com base no estilo, personalidade e orçamento da pessoa.</p>

<p>E o Neuronaut continua gratuito por enquanto para te ajudar com clareza, decisões e próximos passos da vida.</p>

<p><strong>Experimente:</strong></p>

<p>
🎁 <a href="https://zolarus.com">Abrir Zolarus</a>
</p>

<p>
📱 <a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">Android</a> |
🍎 <a href="https://apps.apple.com/us/app/neuronaut/id6758070764">iPhone</a>
</p>

<p>Se estiver gostando, compartilhe com amigos e família.</p>

<hr/>

<p><strong>🇺🇸 English</strong></p>

<p>Hey,</p>

<p>Mother’s Day is coming up — and sometimes the hardest part isn’t buying a gift… it’s choosing the right one.</p>

<p>Zolarus helps you discover gift ideas based on someone’s personality, style, and your budget.</p>

<p>And Neuronaut is still free for now to help you with clarity, decisions, and your next steps in life.</p>

<p><strong>Try them:</strong></p>

<p>
🎁 <a href="https://zolarus.com">Open Zolarus</a>
</p>

<p>
📱 <a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">Android</a> |
🍎 <a href="https://apps.apple.com/us/app/neuronaut/id6758070764">iPhone</a>
</p>

<p>If you’re enjoying them, share them with friends and family.</p>

<hr/>

<p><strong>🇪🇸 Español</strong></p>

<p>Hola,</p>

<p>El Día de las Madres se acerca — y a veces lo más difícil no es comprar un regalo… sino elegir el regalo correcto.</p>

<p>Zolarus te ayuda a encontrar ideas de regalos según la personalidad, el estilo y tu presupuesto.</p>

<p>Y Neuronaut sigue siendo gratis por ahora para ayudarte con claridad, decisiones y tus próximos pasos.</p>

<p><strong>Pruébalos:</strong></p>

<p>
🎁 <a href="https://zolarus.com">Abrir Zolarus</a>
</p>

<p>
📱 <a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">Android</a> |
🍎 <a href="https://apps.apple.com/us/app/neuronaut/id6758070764">iPhone</a>
</p>

<p>Si te gustan, compártelos con amigos y familia.</p>

<hr/>

<p><strong>🇫🇷 Français</strong></p>

<p>Salut,</p>

<p>La Fête des Mères approche — et parfois, le plus difficile n’est pas d’acheter un cadeau… mais de choisir le bon.</p>

<p>Zolarus vous aide à trouver des idées cadeaux selon la personnalité, le style et votre budget.</p>

<p>Et Neuronaut est toujours gratuit pour le moment pour vous aider avec plus de clarté, de décisions et vos prochaines étapes.</p>

<p><strong>Essayez-les :</strong></p>

<p>
🎁 <a href="https://zolarus.com">Ouvrir Zolarus</a>
</p>

<p>
📱 <a href="https://play.google.com/store/apps/details?id=ai.neuronaut.app">Android</a> |
🍎 <a href="https://apps.apple.com/us/app/neuronaut/id6758070764">iPhone</a>
</p>

<p>Si vous aimez les apps, partagez-les avec vos proches.</p>
`

  let sent = 0
  const failed: string[] = []

  for (const user of users ?? []) {
    if (!user.email) continue

    try {
      await resend.emails.send({
        from: 'Neuronaut <support@arison8.com>',
      to: 'matt.sousa241@gmail.com',
   subject: 'Mother’s Day is coming — let AI help you choose the right gift',
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