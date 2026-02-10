<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    
    export let data;
    $: ({ tides, location, error } = data);

    let chartCanvas;
    let chart;

    onMount(() => {
        if (tides && tides.length > 0) {
            // 取最近的 24 小时数据，让雷达图看起来更像一个时钟周期
            const displayData = [...tides].slice(0, 24).reverse();
            
            const labels = displayData.map(d => 
                new Date(d.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            );
            const heights = displayData.map(d => d.height);

            const ctx = chartCanvas.getContext('2d');
            
            // 创建渐变色
            const gradient = ctx.createRadialGradient(ctx.canvas.width / 2, ctx.canvas.height / 2, 0, ctx.canvas.width / 2, ctx.canvas.height / 2, 200);
            gradient.addColorStop(0, 'rgba(49, 130, 206, 0.2)');
            gradient.addColorStop(1, 'rgba(49, 130, 206, 0.8)');

            chart = new Chart(ctx, {
                type: 'radar', // 极坐标雷达图，像海洋的律动
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Tide Height (m)',
                        data: heights,
                        backgroundColor: 'rgba(49, 130, 206, 0.3)',
                        borderColor: '#3182ce',
                        borderWidth: 2,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#3182ce',
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(200, 200, 200, 0.3)' },
                            grid: { color: 'rgba(200, 200, 200, 0.3)' },
                            suggestedMin: 0,
                            ticks: { display: false } // 隐藏枯燥的数字
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    });
</script>

<div style="background: #0f172a; min-height: 100vh; padding: 40px 20px; color: #f8fafc;">
    <main style="max-width: 900px; margin: 0 auto; text-align: center;">
        
        <header style="margin-bottom: 50px;">
            <h1 style="font-family: serif; font-style: italic; font-size: 2.5rem; margin: 0;">{location}</h1>
            <p style="letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem;">
                Mapping the Ocean's Breath (Last 24 Hours)
            </p>
        </header>

        {#if error}
            <p style="color: #ef4444;">{error}</p>
        {:else}
            <div style="height: 500px; margin-bottom: 60px; position: relative; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); border-radius: 50%; padding: 20px;">
                <canvas bind:this={chartCanvas}></canvas>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; background: rgba(255,255,255,0.05); border-radius: 50%; pointer-events: none; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 0 20px rgba(49, 130, 206, 0.2);"></div>
            </div>

            <section style="text-align: left; background: rgba(30, 41, 59, 0.5); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                <h3 style="font-family: serif; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Archive Logs</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    {#each tides.slice(0, 12) as tide}
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.9rem;">
                            <span style="color: #94a3b8;">{new Date(tide.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            <span style="font-weight: bold; color: #3b82f6;">{tide.height.toFixed(2)} m</span>
                            <span style="color: {tide.height > 1.2 ? '#60a5fa' : '#475569'};">{tide.height > 1.2 ? '🌊 FLOW' : '🐚 EBBS'}</span>
                        </div>
                    {/each}
                </div>
            </section>
        {/if}
    </main>
</div>

<style>
    /* 隐藏滚动条让排版更干净 */
    div::-webkit-scrollbar {
        width: 4px;
    }
    div::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 10px;
    }
</style>