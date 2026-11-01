// load-test.js - Teste de Carga de 50 Compradores Simultâneos (QA Stress Test)
const CONCURRENT_USERS = 50;
// Substitua pela URL da sua API de checkout ou endpoint de teste
const TARGET_URL = 'https://josespadeto.github.io/loja-rmcontarecantar/index-master.html';

async function simulateBuyer(id) {
    const startTime = performance.now();
    try {
        const response = await fetch(TARGET_URL, {
            method: 'GET',
            headers: { 'User-Agent': `QABuyerAgent-${id}` }
        });
        const duration = performance.now() - startTime;
        return {
            id,
            status: response.status,
            ok: response.ok,
            duration: duration.toFixed(2)
        };
    } catch (error) {
        return {
            id,
            status: 'ERROR',
            ok: false,
            error: error.message
        };
    }
}

async function runLoadTest() {
    console.is_running = true;
    console.log(`\n🚀 [QA STRESS TEST] Iniciando simulação com ${CONCURRENT_USERS} compradores simultâneos...\n`);
    
    const startTimeTotal = performance.now();
    
    // Dispara todas as 50 requisições em paralelo estrito (Promise.all)
    const promises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
        promises.push(simulateBuyer(i));
    }

    const results = await Promise.all(promises);
    const totalTimeTotal = performance.now() - startTimeTotal;

    // Métricas de Análise (QA Metrics)
    const successes = results.filter(r => r.ok);
    const failures = results.filter(r => !r.ok);
    const durations = successes.map(r => parseFloat(r.duration));
    
    const avgDuration = durations.length > 0 ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;

    console.log(`==================================================`);
    console.log(`📊 RELATÓRIO DE EXECUÇÃO DE QA (50 VUs)`);
    console.log(`==================================================`);
    console.log(`• Tempo total de processamento: ${totalTimeTotal.toFixed(2)} ms`);
    console.log(`• Requisições bem-sucedidas: ${successes.length}/${CONCURRENT_USERS}`);
    console.log(`• Falhas detectadas: ${failures.length}`);
    console.log(`• Latência Média: ${avgDuration} ms`);
    console.log(`• Latência Mínima: ${minDuration} ms`);
    console.log(`• Latência Máxima: ${maxDuration} ms`);
    console.log(`==================================================`);

    if (failures.length > 0) {
        console.warn(`⚠️ Alerta QA: Foram detectadas falhas em algumas requisições.`);
        console.table(failures);
    } else {
        console.log(`✅ [APROVADO] Sistema suportou 50 conexões simultâneas com 100% de sucesso.`);
    }
}

runLoadTest();
