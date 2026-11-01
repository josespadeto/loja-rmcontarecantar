export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { customer, items } = req.body;

        const dbProducts = {
            'RM-EBK-01': { title: 'E-book: Crônicas e Bastidores da MPB', unit_price: 47.90 },
            'RM-TSH-02': { title: 'Camiseta Minimalista: Bossa & Alma', unit_price: 89.90 },
            'RM-VNL-03': { title: 'Vinil de Colecionador: Contar e Cantar', unit_price: 249.90 },
            'RM-BOX-04': { title: 'Box Acervo: A História Completa', unit_price: 349.90 }
        };

        const mpItems = [];
        
        for (const item of items) {
            const realProduct = dbProducts[item.id];
            if (realProduct) {
                mpItems.push({
                    title: realProduct.title,
                    quantity: Number(item.qty),
                    unit_price: Number(realProduct.unit_price),
                    currency_id: "BRL"
                });
            }
        }

        if (mpItems.length === 0) {
            return res.status(400).json({ error: 'Carrinho inválido ou vazio.' });
        }

        const preferenceData = {
            items: mpItems,
            payer: {
                name: customer.name,
                email: customer.email,
                identification: { type: "CPF", number: customer.cpf }
            },
            back_urls: {
                success: "https://loja.rmcontarecantar.art.br/checkout.html?status=success",
                failure: "https://loja.rmcontarecantar.art.br/checkout.html?status=failure",
                pending: "https://loja.rmcontarecantar.art.br/checkout.html?status=pending"
            },
            auto_return: "approved",
            statement_descriptor: "RM ACERVO"
        };

        const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData)
        });

        const mpResult = await mpResponse.json();

        if (mpResult.init_point) {
            return res.status(200).json({ init_point: mpResult.init_point });
        } else {
            console.error("Erro MP:", mpResult);
            return res.status(500).json({ error: 'Falha ao gerar preferência no Mercado Pago' });
        }

    } catch (error) {
        console.error("Erro Interno:", error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
