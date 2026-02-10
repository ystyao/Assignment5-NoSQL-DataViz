<script>
    import { onMount, tick } from 'svelte';
    import { enhance } from '$app/forms';
    import Chart from 'chart.js/auto';
    
    export let data;
    export let form; // 接收 action 返回的失败信息

    // 响应式声明：当后端 data 改变时，自动同步本地状态
    $: localTides = data.tides || [];
    $: location = data.location;
    $: error = data.error || (form?.message ? form.message : null);

    let chartCanvas;
    let chart;

    // 表单状态
    let newTime = new Date().toISOString().slice(0, 16);
    let newHeight = 0;
    let editingId = null;

    // 更新图表的函数
    function updateChart() {
        if (!chart || !localTides.length) return;
        
        // 取最近的 24 小时数据展示
        const displayData = [...localTides].slice(0, 24).reverse();
        const labels = displayData.map(d => 
            new Date(d.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );
        const heights = displayData.map(d => d.height);

        chart.data.labels = labels;
        chart.data.datasets[0].data = heights;
        chart.update();
    }

    // 当 localTides 发生任何变化（通过后端更新）时，重绘图表
    $: if (localTides && chart) {
        updateChart();
    }

    function startEdit(tide) {
        editingId = tide.id;
        newTime = new Date(tide.time).toISOString().slice(0, 16);
        newHeight = tide.height;
        // 滚动到表单位置
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    onMount(() => {
        const ctx = chartCanvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Tide Height (m)',
                    data: [],
                    backgroundColor: 'rgba(49, 130, 206, 0.3)',
                    borderColor: '#3182ce',
                    borderWidth: 2,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { suggestedMin: 0, ticks: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
        updateChart();
    });
</script>

<div style="background: #0f172a; min-height: 100vh; padding: 40px 20px; color: #f8fafc; font-family: sans-serif;">
    <main style="max-width: 900px; margin: 0 auto; text-align: center;">
        
        <header style="margin-bottom: 50px;">
            <h1 style="font-family: serif; font-style: italic; font-size: 2.5rem; margin: 0;">{location}</h1>
            <p style="letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem;">
                Mapping the Ocean's Breath
            </p>
        </header>

        {#if error}
            <p style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 10px; border-radius: 8px;">{error}</p>
        {/if}

        <div style="height: 400px; margin-bottom: 40px; position: relative; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); border-radius: 50%; padding: 20px;">
            <canvas bind:this={chartCanvas}></canvas>
        </div>

        <section style="background: rgba(30, 41, 59, 0.8); padding: 20px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #334155;">
            <h3 style="margin-top: 0; font-size: 1rem; color: #3b82f6;">{editingId ? 'Edit Record' : 'Manual Entry'}</h3>
            
            <form method="POST" action="?/upsert" use:enhance={() => {
                return async ({ update }) => {
                    await update(); // 同步后端数据到 data.tides
                    editingId = null; // 提交成功后重置编辑状态
                };
            }} style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                
                <input type="hidden" name="id" value={editingId} />
                <input type="datetime-local" name="time" bind:value={newTime} required style="background: #0f172a; border: 1px solid #334155; color: white; padding: 8px; border-radius: 5px;" />
                <input type="number" step="0.01" name="height" bind:value={newHeight} required style="width: 100px; background: #0f172a; border: 1px solid #334155; color: white; padding: 8px; border-radius: 5px;" />
                
                <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    {editingId ? 'Update Record' : 'Add to Archive'}
                </button>

                {#if editingId}
                    <button type="button" on:click={() => {editingId = null}} style="background: transparent; border: 1px solid #475569; color: white; padding: 8px; border-radius: 5px;">Cancel</button>
                {/if}
            </form>
        </section>

        <section style="text-align: left; background: rgba(30, 41, 59, 0.5); padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            <h3 style="font-family: serif; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Archive Logs (Last 7 Days)</h3>
            <div style="max-height: 400px; overflow-y: auto;">
                {#each localTides as tide (tide.id)}
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="flex: 1;">
                            <span style="color: #94a3b8; font-size: 0.9rem;">{new Date(tide.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <span style="font-weight: bold; color: #3b82f6;">{tide.height.toFixed(2)} m</span>
                        </div>
                        <div style="display: flex; gap: 15px; flex: 1; justify-content: flex-end;">
                            <button on:click={() => startEdit(tide)} style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.8rem; hover: color: white;">Edit</button>
                            
                            <form method="POST" action="?/delete" use:enhance>
                                <input type="hidden" name="id" value={tide.id} />
                                <button type="submit" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem;">Delete</button>
                            </form>
                        </div>
                    </div>
                {:else}
                    <p style="color: #475569; text-align: center;">No logs found in the depths.</p>
                {/each}
            </div>
        </section>
    </main>
</div>

<style>
    div::-webkit-scrollbar { width: 4px; }
    div::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
    input:focus { outline: 1px solid #3b82f6; }
    button:hover { opacity: 0.8; }
</style>