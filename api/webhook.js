async function enviarEmailConfirmacao(emailCliente, valorPago, idPedido) {
    try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) return;

        const htmlConteudo = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                <h2 style="color: #3b82f6;">Pagamento Aprovado!</h2>
                <p>Olá! Seu pedido no Acervo <strong>RM Contar e Cantar</strong> foi processado com sucesso.</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>ID do Pedido:</strong> ${idPedido}</p>
                    <p style="margin: 8px 0 0 0;"><strong>Valor Pago:</strong> R$ ${valorPago.toFixed(2).replace('.', ',')}</p>
                </div>
                <p>Nossa equipe já está separando o seu material.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático do portal RM Contar e Cantar.</p>
            </div>
        `;

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: 'RM Acervo <onboarding@resend.dev>', 
                to: emailCliente, 
                subject: `RM Contar e Cantar - Pagamento Confirmado #${idPedido}`,
                html: htmlConteudo
            })
        });
    } catch (error) {
        console.error("Falha ao tentar conectar com Resend:", error);
    }
}

async function registrarVendaNoSheets(emailCliente, valorPago, idPedido) {
    try {
        const scriptUrl = process.env.GOOGLE_SHEETS_URL;
        const secretToken = "VANGUARD_LABS_2026_SECURE_KEY";
        
        if (!scriptUrl) return;

        await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                token: secretToken,
                idPedido: idPedido,
                email: emailCliente,
                valor: valorPago
            })
        });
    } catch (error) {
        console.error("Falha ao conectar com Google Sheets:", error);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Método não permitido');

    try {
        const body = req.body;
        const query = req.query;
        let paymentId = null;

        if (body && body.data && body.data.id) paymentId = body.data.id;
        else if (query && query['data.id']) paymentId = query['data.id'];
        else if (body && body.action === 'payment.created' && body.id) paymentId = body.id;

        if (!paymentId) return res.status(200).send('Nenhum ID de pagamento acionável');

        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: { "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        });

        if (!mpResponse.ok) return res.status(500).send('Falha ao consultar MP');

        const paymentData = await mpResponse.json();
        const status = paymentData.status;
        const emailComprador = paymentData.payer?.email;
        const valorPago = paymentData.transaction_amount;

        if (status === 'approved') {
            console.log(`✅ SUCESSO: Pagamento ${paymentId} aprovado!`);
            await enviarEmailConfirmacao(emailComprador, valorPago, paymentId);
            await registrarVendaNoSheets(emailComprador, valorPago, paymentId);
        }

        res.status(200).send('Webhook Processado com Sucesso');

    } catch (error) {
        console.error("Erro interno no processamento do Webhook:", error);
        res.status(500).send('Erro interno');
    }
}
