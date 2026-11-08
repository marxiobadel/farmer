<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8">
    <title>Bon de bienvenue MontView Farm</title>
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f4; margin: 0; padding: 24px; color: #1c1917;">
    <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4;">
        <tr>
            <td style="background-color: #d97706; padding: 28px 24px; text-align: center; color: #ffffff;">
                <h1
                    style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    Bonne nouvelle de MontView Farm !</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 32px 24px;">
                <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>{{ $user->firstname }}</strong> !</p>
                <p style="font-size: 14px; line-height: 1.6; color: #57534e;">
                    Merci pour votre inscription. Nous vous offrons une réduction immédiate sur votre première commande,
                    valable sur l'ensemble de nos produits frais.
                </p>

                <div
                    style="background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
                    <span
                        style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #92400e; display: block; margin-bottom: 4px;">Votre
                        code personnel</span>
                    <span
                        style="font-family: monospace; font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #b45309;">{{ $promoCode }}</span>
                </div>

                <ul style="font-size: 13px; color: #78716c; line-height: 1.6; padding-left: 20px;">
                    <li>Valable jusqu'au <strong>{{ $expirationDate }}</strong></li>
                    <li>Utilisable une seule fois sur votre compte</li>
                </ul>

                <p
                    style="font-size: 13px; color: #a8a29e; margin-top: 24px; border-top: 1px solid #f5f5f4; padding-top: 16px;">
                    Votre compte a été activé automatiquement avec votre adresse e-mail qui constitue également votre mot de passe.
                </p>

                <div style="text-align: center; margin-top: 28px;">
                    <a href="{{ config('app.url') }}"
                        style="background-color: #d97706; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">Découvrir
                        la boutique</a>
                </div>
            </td>
        </tr>
    </table>
</body>

</html>
