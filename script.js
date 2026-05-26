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

    let matrizPaginas = Array(numFrames).fill(null).map(() => Array(duracion).fill(''));
    let matrizBits    = Array(numFrames).fill(null).map(() => Array(duracion).fill(''));
    let matrizAp      = Array(numFrames).fill(null).map(() => Array(duracion).fill(''));
    let historialFallos = Array(duracion).fill('');
    let ultimoReemplazo = -1;

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
            historialFallos[t] = 'x';

            while (true) {
                if (frames[puntero] === -1) {
                    // Carga en frame vacío: puntero visual queda en F1, no se mueve
                    frames[puntero] = paginaActual;
                    bitsReferencia[puntero] = 1;
                    puntero = (puntero + 1) % numFrames;
                    break;
                } else if (bitsReferencia[puntero] === 1) {
                    bitsReferencia[puntero] = 0;
                    puntero = (puntero + 1) % numFrames;
                } else {
                    // Reemplazo real (pila llena): ahora sí mueve el puntero visual
                    frames[puntero] = paginaActual;
                    bitsReferencia[puntero] = 1;
                    ultimoReemplazo = puntero;
                    puntero = (puntero + 1) % numFrames;
                    break;
                }
            }
        }

        for (let i = 0; i < numFrames; i++) {
            if (frames[i] !== -1) {
                matrizPaginas[i][t] = frames[i];
                matrizBits[i][t]    = bitsReferencia[i];
            }
        }
        // Mientras la pila se llena: * en F1 (índice 0). Cuando hay reemplazo real: * en el frame reemplazado.
        let posAp = ultimoReemplazo !== -1 ? ultimoReemplazo : 0;
        if (frames[posAp] !== -1) {
            matrizAp[posAp][t] = '*';
        }
    }

    renderTablaFinalClock('clock-tabla-final', paginas, matrizPaginas, matrizBits, matrizAp, historialFallos);
    document.getElementById('clock-fallos').innerText = fallosPagina;
    document.getElementById('clock-resultados').style.display = 'block';
}

function renderTablaFinalClock(containerId, paginas, matrizPaginas, matrizBits, matrizAp, historialFallos) {
    let duracion = paginas.length;
    let numFrames = matrizPaginas.length;

    let html = `<table class="clock-table"><thead>`;

    // Fila Demanda
    html += `<tr><th>Demanda</th>`;
    for (let t = 0; t < duracion; t++) {
        html += `<th colspan="3" class="clock-demand">${paginas[t]}</th>`;
    }
    html += `</tr>`;

    // Fila Fallo de página
    html += `<tr><th>Fallo de página</th>`;
    for (let t = 0; t < duracion; t++) {
        let f = historialFallos[t];
        html += `<td colspan="3" class="${f ? 'clock-fault' : ''}">${f}</td>`;
    }
    html += `</tr>`;

    // Fila sub-cabecera Bit / Ap
    html += `<tr><th>Frame</th>`;
    for (let t = 0; t < duracion; t++) {
        html += `<th class="clock-sh"></th><th class="clock-sh">Bit</th><th class="clock-sh">Ap</th>`;
    }
    html += `</tr></thead><tbody>`;

    // Filas de frames
    for (let i = 0; i < numFrames; i++) {
        html += `<tr><th>F${i + 1}</th>`;
        for (let t = 0; t < duracion; t++) {
            let pag = matrizPaginas[i][t];
            let bit = matrizBits[i][t];
            let ap  = matrizAp[i][t];
            if (pag === '') {
                html += `<td></td><td></td><td></td>`;
            } else {
                html += `<td>${pag}</td><td>${bit}</td><td class="${ap ? 'clock-ap' : ''}">${ap}</td>`;
            }
        }
        html += `</tr>`;
    }

    // Fila Tiempo
    html += `<tr><th>Tiempo</th>`;
    for (let t = 0; t < duracion; t++) {
        html += `<td colspan="3">${t + 1}</td>`;
    }
    html += `</tr></tbody></table>`;

    document.getElementById(containerId).innerHTML = html;
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

    let colaPorTiempo = construirRastreoPlanificacion(procesos, maxTiempo);
    renderResultadosPlanificacion('fcfs', procesos, diagramaGantt, maxTiempo, colaPorTiempo);
    
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

    let colaPorTiempo = construirRastreoPlanificacion(terminados, maxTiempo);
    renderResultadosPlanificacion('sjf', terminados, diagramaGantt, maxTiempo, colaPorTiempo);

    let promEspera  = terminados.reduce((acc, p) => acc + p.espera,  0) / terminados.length;
    let promRetorno = terminados.reduce((acc, p) => acc + p.retorno, 0) / terminados.length;
    metricasGlobales.sjf = { espera: promEspera.toFixed(2), retorno: promRetorno.toFixed(2) };
    actualizarComparativaGlobal();
}

function construirRastreoPlanificacion(procesos, maxTiempo) {
    let rastreo = [];

    for (let t = 0; t < maxTiempo; t++) {
        let ejecutando = procesos.find(p => p.comienzo <= t && t < p.fin);

        let esperando = procesos
            .filter(p => p.llegada <= t && p.fin > t && (!ejecutando || p.id !== ejecutando.id))
            .sort((a, b) => a.llegada - b.llegada || a.ejecucion - b.ejecucion || a.id.localeCompare(b.id));

        rastreo.push({
            tiempo: t,
            cpu: ejecutando ? ejecutando.id : '—',
            espera: esperando.length > 0 ? esperando.map(p => p.id).join(', ') : 'Vacía'
        });
    }

    return rastreo;
}

function renderListaEspera(alg, colaPorTiempo) {
    let html = `<table class="queue-table"><thead><tr><th>Tiempo</th><th class="queue-cpu">CPU</th><th>Lista de Espera</th></tr></thead><tbody>`;

    colaPorTiempo.forEach(item => {
        let cpuClase = item.cpu === '—' ? 'queue-idle' : 'queue-exec';
        let esperaClase = item.espera === 'Vacía' ? 'queue-empty' : '';

        html += `<tr>
            <td class="queue-time">${item.tiempo + 1}</td>
            <td class="queue-cpu ${cpuClase}">${item.cpu}</td>
            <td class="queue-wait ${esperaClase}">${item.espera}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    document.getElementById(`${alg}-queue-container`).innerHTML = html;
}

function renderResultadosPlanificacion(alg, procesos, gantt, maxTiempo, colaPorTiempo) {
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

    let table = document.createElement('table');
    table.className = 'gantt-table';

    let thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>Proceso</th>${Array.from({ length: maxTiempo }, (_, t) => `<th>${t}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    let tbody = document.createElement('tbody');
    Object.keys(gantt).sort().forEach(procId => {
        let row = document.createElement('tr');
        row.innerHTML = `<th>${procId}</th>`;

        for (let t = 0; t < maxTiempo; t++) {
            let estado = gantt[procId][t] || ' ';
            let cell = document.createElement('td');
            cell.className = `gantt-block block-${estado.toLowerCase().trim() || 'vacio'}`;
            cell.innerText = estado !== ' ' ? estado : '';
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    chartContainer.appendChild(table);

    renderListaEspera(alg, colaPorTiempo);
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