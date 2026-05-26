// Variables para métricas comparativas
let metricasGlobales = {
    fcfs: { espera: 0, retorno: 0 },
    sjf: { espera: 0, retorno: 0 }
};

// Control de Navegación del Menú Izquierdo
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Configuración de controles Dinámicos Manual/Aleatorio
function ajustarConfiguracion(algoritmo) {
    const config = document.getElementById(`${algoritmo}-config`).value;
    const manualInputs = document.getElementById(`${algoritmo}-manual-inputs`);
    if(config === 'manual') {
        manualInputs.style.display = 'flex';
    } else {
        manualInputs.style.display = 'none';
    }
}

// Agregar y eliminar renglones dinámicamente en FCFS / SJF
function agregarFila(tablaId) {
    const tbody = document.getElementById(tablaId).getElementsByTagName('tbody')[0];
    const letraProceso = String.fromCharCode(65 + tbody.rows.length);
    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
        <td>${letraProceso}</td>
        <td><input type="number" value="0" class="proc-llegada"></td>
        <td><input type="number" value="5" class="proc-ejec"></td>
        <td><button class="btn-del" onclick="eliminarFila(this)">X</button></td>
    `;
    tbody.appendChild(nuevaFila);
}

function eliminarFila(boton) {
    const fila = boton.parentNode.parentNode;
    fila.parentNode.removeChild(fila);
}

// ================= ALGORITMO DE REEMPLAZO: CLOCK (RELOJ) =================
function ejecutarClock() {
    const config = document.getElementById('clock-config').value;
    let numFrames = 4;
    let paginas = [];
    let duracion = parseInt(document.getElementById('clock-duration').value) || 15;

    if(config === 'manual') {
        numFrames = parseInt(document.getElementById('clock-frames').value) || 4;
        const strInput = document.getElementById('clock-string').value;
        if(strInput) {
            paginas = strInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        }
    } else {
        numFrames = config === '4-8' ? 4 : 8;
        const totalProcesosPool = config === '4-8' ? 8 : 16;
        for(let i = 0; i < duracion; i++) {
            paginas.push(Math.floor(Math.random() * totalProcesosPool) + 1);
        }
    }

    if(paginas.length === 0) {
        for(let i = 0; i < duracion; i++) paginas.push(Math.floor(Math.random() * 8) + 1);
    }
    if(paginas.length > duracion) paginas = paginas.slice(0, duracion);
    while(paginas.length < duracion) paginas.push(Math.floor(Math.random() * 8) + 1);

    renderTablaInicial('clock-tabla-inicial', numFrames, [...new Set(paginas)]);

    let frames = Array(numFrames).fill(-1);
    let bitsReferencia = Array(numFrames).fill(0);
    let puntero = 0;
    let fallosPagina = 0;
    
    let matrizResultado = Array(numFrames).fill(null).map(() => Array(duracion).fill(''));
    let historialFallos = Array(duracion).fill('');
    let historialPunteros = Array(duracion).fill(-1);

    for (let t = 0; t < duracion; t++) {
        let paginaActual = paginas[t];
        let encontrado = false;

        for (let i = 0; i < numFrames; i++) {
            if (frames[i] === paginaActual) {
                bitsReferencia[i] = 1;
                encontrado = true;
                break;
            }
        }

        if (!encontrado) {
            fallosPagina++;
            historialFallos[t] = 'X';
            
            while (true) {
                if (frames[puntero] === -1) {
                    frames[puntero] = paginaActual;
                    bitsReferencia[puntero] = 1;
                    historialPunteros[t] = puntero;
                    puntero = (puntero + 1) % numFrames;
                    break;
                } else if (bitsReferencia[puntero] === 1) {
                    bitsReferencia[puntero] = 0;
                    puntero = (puntero + 1) % numFrames;
                } else {
                    frames[puntero] = paginaActual;
                    bitsReferencia[puntero] = 1;
                    historialPunteros[t] = puntero;
                    puntero = (puntero + 1) % numFrames;
                    break;
                }
            }
        }

        for (let i = 0; i < numFrames; i++) {
            if (frames[i] !== -1) {
                matrizResultado[i][t] = `${frames[i]} (${bitsReferencia[i]})`;
            }
        }
    }

    renderTablaFinalReemplazo('clock-tabla-final', paginas, matrizResultado, historialFallos, historialPunteros);
    document.getElementById('clock-fallos').innerText = fallosPagina;
    document.getElementById('clock-resultados').style.display = 'block';
}

// ================= ALGORITMO DE REEMPLAZO: ÓPTIMO =================
function ejecutarOptimo() {
    const config = document.getElementById('optimo-config').value;
    let numFrames = 4;
    let paginas = [];
    let duracion = parseInt(document.getElementById('optimo-duration').value) || 15;

    if(config === 'manual') {
        numFrames = parseInt(document.getElementById('optimo-frames').value) || 4;
        const strInput = document.getElementById('optimo-string').value;
        if(strInput) {
            paginas = strInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        }
    } else {
        numFrames = config === '4-8' ? 4 : 8;
        const totalProcesosPool = config === '4-8' ? 8 : 16;
        for(let i = 0; i < duracion; i++) {
            paginas.push(Math.floor(Math.random() * totalProcesosPool) + 1);
        }
    }

    if(paginas.length === 0) {
        for(let i = 0; i < duracion; i++) paginas.push(Math.floor(Math.random() * 8) + 1);
    }
    if(paginas.length > duracion) paginas = paginas.slice(0, duracion);
    while(paginas.length < duracion) paginas.push(Math.floor(Math.random() * 8) + 1);

    renderTablaInicial('optimo-tabla-inicial', numFrames, [...new Set(paginas)]);

    let frames = Array(numFrames).fill(-1);
    let fallosPagina = 0;
    let matrizResultado = Array(numFrames).fill(null).map(() => Array(duracion).fill(''));
    let historialFallos = Array(duracion).fill('');

    for (let t = 0; t < duracion; t++) {
        let paginaActual = paginas[t];
        let encontrado = false;

        for (let i = 0; i < numFrames; i++) {
            if (frames[i] === paginaActual) {
                encontrado = true;
                break;
            }
        }

        if (!encontrado) {
            fallosPagina++;
            historialFallos[t] = 'X';

            let asignadoVacuo = false;
            for (let i = 0; i < numFrames; i++) {
                if (frames[i] === -1) {
                    frames[i] = paginaActual;
                    asignadoVacuo = true;
                    break;
                }
            }

            if (!asignadoVacuo) {
                let indiceReemplazo = -1;
                let maxTiempoFuturo = -1;

                for (let i = 0; i < numFrames; i++) {
                    let proximoUso = Infinity;
                    for (let j = t + 1; j < duracion; j++) {
                        if (paginas[j] === frames[i]) {
                            proximoUso = j;
                            break;
                        }
                    }

                    if (proximoUso > maxTiempoFuturo) {
                        maxTiempoFuturo = proximoUso;
                        indiceReemplazo = i;
                    }
                }
                frames[indiceReemplazo] = paginaActual;
            }
        }

        for (let i = 0; i < numFrames; i++) {
            if (frames[i] !== -1) matrizResultado[i][t] = frames[i];
        }
    }

    renderTablaFinalReemplazo('optimo-tabla-final', paginas, matrizResultado, historialFallos, null);
    document.getElementById('optimo-fallos').innerText = fallosPagina;
    document.getElementById('optimo-resultados').style.display = 'block';
}

function renderTablaInicial(containerId, framesCount, procesosUnicos) {
    let html = `<table><tr><th>Frames Activos</th><td>${framesCount} Frames</td></tr>`;
    html += `<tr><th>Procesos en Cadena</th><td>[ ${procesosUnicos.join(', ')} ]</td></tr></table>`;
    document.getElementById(containerId).innerHTML = html;
}

function renderTablaFinalReemplazo(containerId, demandas, matriz, fallos, punteros) {
    let html = `<table><thead><tr><th>Tiempo</th>`;
    for(let t=0; t<demandas.length; t++) html += `<th>${t+1}</th>`;
    html += `</tr><tr><th>Demanda</th>`;
    for(let t=0; t<demandas.length; t++) html += `<th style="background-color: #f1f3f5;">${demandas[t]}</th>`;
    html += `</tr></thead><tbody>`;

    for(let i=0; i<matriz.length; i++) {
        html += `<tr><th>Frame ${i+1}</th>`;
        for(let t=0; t<demandas.length; t++) {
            let clasePuntero = (punteros && punteros[t] === i) ? 'class="pointer-active"' : '';
            html += `<td ${clasePuntero}>${matriz[i][t]}</td>`;
        }
        html += `</tr>`;
    }

    html += `<tr><th>Fallo</th>`;
    for(let t=0; t<demandas.length; t++) {
        html += `<td style="color:#dc3545; font-weight:bold;">${fallos[t]}</td>`;
    }
    html += `</tr></tbody></table>`;
    document.getElementById(containerId).innerHTML = html;
}

// ================= AUXILIAR: Parsear inputs de tabla =================
// CORRECCIÓN 1: uso de isNaN() en lugar de || para distinguir entre
// "el usuario escribió 0" y "el campo está vacío/inválido"
function obtenerProcesosDeTabla(tablaId) {
    const rows = document.getElementById(tablaId).getElementsByTagName('tbody')[0].rows;
    let lista = [];
    for (let i = 0; i < rows.length; i++) {
        const llegadaVal = parseInt(rows[i].getElementsByClassName('proc-llegada')[0].value);
        const ejecucionVal = parseInt(rows[i].getElementsByClassName('proc-ejec')[0].value);
        lista.push({
            id: rows[i].cells[0].innerText.trim(),
            llegada: isNaN(llegadaVal) ? 0 : llegadaVal,
            ejecucion: isNaN(ejecucionVal) || ejecucionVal <= 0 ? 1 : ejecucionVal
        });
    }
    return lista;
}

// ================= PLANIFICACIÓN DE CPU: FCFS =================
function ejecutarFCFS() {
    let procesos = obtenerProcesosDeTabla('fcfs-input-table');
    procesos.sort((a, b) => a.llegada - b.llegada);

    let tiempoActual = 0;
    let diagramaGantt = {};

    procesos.forEach(p => {
        diagramaGantt[p.id] = [];
        if (tiempoActual < p.llegada) tiempoActual = p.llegada;
        p.comienzo = tiempoActual;
        p.fin = p.comienzo + p.ejecucion;
        p.retorno = p.fin - p.llegada;
        p.espera = p.comienzo - p.llegada;
        tiempoActual = p.fin;
    });

    let maxTiempo = Math.max(...procesos.map(p => p.fin), 35);

    procesos.forEach(p => {
        for(let t=0; t<maxTiempo; t++) {
            if(t >= p.llegada && t < p.comienzo) diagramaGantt[p.id].push('L');
            else if(t >= p.comienzo && t < p.fin) diagramaGantt[p.id].push('E');
            else if(t >= p.fin) diagramaGantt[p.id].push('F');
            else diagramaGantt[p.id].push(' ');
        }
    });

    renderResultadosPlanificacion('fcfs', procesos, diagramaGantt, maxTiempo);
    
    let promEspera = procesos.reduce((acc, p) => acc + p.espera, 0) / procesos.length;
    let promRetorno = procesos.reduce((acc, p) => acc + p.retorno, 0) / procesos.length;
    metricasGlobales.fcfs = { espera: promEspera.toFixed(2), retorno: promRetorno.toFixed(2) };
    actualizarComparativaGlobal();
}

// ================= PLANIFICACIÓN DE CPU: SJF =================
// CORRECCIÓN 2: spread explícito con map({ ...p }) para que cada objeto
// sea independiente y las propiedades calculadas no se pierdan por referencia.
// CORRECCIÓN 3: sort con desempate estable: ejecucion → llegada → id,
// para que procesos con el mismo tiempo de ráfaga siempre salgan en el
// mismo orden y no produzcan resultados distintos en cada ejecución.
function ejecutarSJF() {
    let procesos = obtenerProcesosDeTabla('sjf-input-table');
    let pendientes = procesos.map(p => ({ ...p }));
    let terminados = [];
    let tiempoActual = 0;
    let diagramaGantt = {};

    procesos.forEach(p => diagramaGantt[p.id] = []);

    while (pendientes.length > 0) {
        let disponibles = pendientes.filter(p => p.llegada <= tiempoActual);

        if (disponibles.length === 0) {
            tiempoActual = Math.min(...pendientes.map(p => p.llegada));
            continue;
        }

        disponibles.sort((a, b) =>
            a.ejecucion !== b.ejecucion ? a.ejecucion - b.ejecucion :
            a.llegada   !== b.llegada   ? a.llegada   - b.llegada   :
            a.id.localeCompare(b.id)
        );

        let seleccionado = disponibles[0];

        seleccionado.comienzo = tiempoActual;
        seleccionado.fin      = seleccionado.comienzo + seleccionado.ejecucion;
        seleccionado.retorno  = seleccionado.fin - seleccionado.llegada;
        seleccionado.espera   = seleccionado.comienzo - seleccionado.llegada;

        tiempoActual = seleccionado.fin;
        terminados.push(seleccionado);
        pendientes = pendientes.filter(p => p.id !== seleccionado.id);
    }

    let maxTiempo = Math.max(...terminados.map(p => p.fin), 35);

    terminados.forEach(p => {
        for (let t = 0; t < maxTiempo; t++) {
            if      (t >= p.llegada  && t < p.comienzo) diagramaGantt[p.id].push('L');
            else if (t >= p.comienzo && t < p.fin)      diagramaGantt[p.id].push('E');
            else if (t >= p.fin)                         diagramaGantt[p.id].push('F');
            else                                         diagramaGantt[p.id].push(' ');
        }
    });

    renderResultadosPlanificacion('sjf', terminados, diagramaGantt, maxTiempo);

    let promEspera  = terminados.reduce((acc, p) => acc + p.espera,  0) / terminados.length;
    let promRetorno = terminados.reduce((acc, p) => acc + p.retorno, 0) / terminados.length;
    metricasGlobales.sjf = { espera: promEspera.toFixed(2), retorno: promRetorno.toFixed(2) };
    actualizarComparativaGlobal();
}

function renderResultadosPlanificacion(alg, procesos, gantt, maxTiempo) {
    procesos.sort((a,b) => a.id.localeCompare(b.id));

    let promEspera  = (procesos.reduce((acc, p) => acc + p.espera,  0) / procesos.length).toFixed(2);
    let promRetorno = (procesos.reduce((acc, p) => acc + p.retorno, 0) / procesos.length).toFixed(2);

    let htmlTabla = `<table><thead><tr>
        <th>Proceso</th><th>T. Ejecución</th><th>T. Llegada</th>
        <th>T. Inicio</th><th>T. Fin</th><th>T. Retorno</th><th>T. Espera</th>
    </tr></thead><tbody>`;

    procesos.forEach(p => {
        htmlTabla += `<tr>
            <td><strong>${p.id}</strong></td><td>${p.ejecucion}</td><td>${p.llegada}</td>
            <td>${p.comienzo}</td><td>${p.fin}</td><td>${p.retorno}</td><td>${p.espera}</td>
        </tr>`;
    });

    htmlTabla += `<tr style="background-color: #f8f9fa; font-weight:bold;">
        <td colspan="5" style="text-align:right;">Promedios Globales:</td>
        <td style="color:#007bff;">${promRetorno}</td><td style="color:#28a745;">${promEspera}</td>
    </tr></tbody></table>`;

    document.getElementById(`${alg}-tabla-final`).innerHTML = htmlTabla;

    let chartContainer = document.getElementById(`${alg}-gantt`);
    chartContainer.innerHTML = '';

    Object.keys(gantt).sort().forEach(procId => {
        let row = document.createElement('div');
        row.className = 'gantt-row';
        
        let label = document.createElement('div');
        label.className = 'gantt-label';
        label.innerText = `Proc ${procId}`;
        row.appendChild(label);

        let timeline = document.createElement('div');
        timeline.className = 'gantt-timeline';

        gantt[procId].forEach(estado => {
            let block = document.createElement('div');
            block.className = `gantt-block block-${estado.toLowerCase().trim() || 'vacio'}`;
            block.innerText = estado !== ' ' ? estado : '';
            timeline.appendChild(block);
        });

        row.appendChild(timeline);
        chartContainer.appendChild(row);
    });

    document.getElementById(`${alg}-resultados`).style.display = 'block';
}

function actualizarComparativaGlobal() {
    document.getElementById('comp-fcfs-espera').innerText   = metricasGlobales.fcfs.espera   || '-';
    document.getElementById('comp-fcfs-retorno').innerText  = metricasGlobales.fcfs.retorno  || '-';
    document.getElementById('comp-sjf-espera').innerText    = metricasGlobales.sjf.espera    || '-';
    document.getElementById('comp-sjf-retorno').innerText   = metricasGlobales.sjf.retorno   || '-';

    if (metricasGlobales.fcfs.espera > 0 && metricasGlobales.sjf.espera > 0) {
        let diff = (metricasGlobales.fcfs.espera - metricasGlobales.sjf.espera).toFixed(2);
        document.getElementById('analisis-comportamiento').innerHTML = `
            El algoritmo <strong>SJF</strong> reduce el Tiempo Medio de Espera en <strong>${Math.abs(diff)} unidades de tiempo</strong> frente a <strong>FCFS</strong> en esta corrida, evitando que ráfagas largas detengan procesos cortos de manera ineficiente.
        `;
    }
}