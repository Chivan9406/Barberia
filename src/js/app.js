let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarApp();
});

function iniciarApp() {
    mostrarServicios();

    //Resalta el div actual dependiendo el tab
    mostrarSeccion();

    //Oculta o muestra la sección dependiendo el tab
    cambiarSeccion();

    //Paginación siguiente y anterior
    paginaSiguiente();
    paginaAnterior();

    //Comprueba la pagina actual para ocultar o mostrar paginacion
    botonesPaginador();

    //Muestra el resumen de la cita o error en caso de no pasar la validación
    mostrarResumen();

    //Almacena el nombre de la cita en el objeto
    nombreCita();

    //Almacena la fecha de la cita en el objeto
    fechaChita();

    //Deshabilita dias pasados
    deshabilitarFechaAnterior();

    //Almacena la hora de la cita en el objeto
    horaCita();
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina ++;

        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina --;

        botonesPaginador();
    })
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if(pagina === 1) {
        paginaAnterior.classList.add('ocultar');
    } else if(pagina === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    //Cambia la seccion
    mostrarSeccion();
}

function mostrarSeccion() {    
    //Eliminar mostrar sección anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');

    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar-seccion');
    }

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');
    
    //Eliminar clase 'actual' en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual');

    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    //Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion() {
    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();

            pagina = parseInt(e.target.dataset.paso);

            //Funcion mostrar sección
            mostrarSeccion();

            botonesPaginador();
        })
    })
}

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json')
        const db = await resultado.json();
        const {servicios} = db;

        //Generar HTML
        servicios.forEach(servicio => {
            const {id, nombre, precio} = servicio;

            //DOM Scripting
            //Nombre
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            //Precio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //Contenedor del servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            //Selecciona un servicio
            servicioDiv.onclick = seleccionarServicio;

            //Agregar al div
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //Inyectar ID
            document.querySelector('#servicios').appendChild(servicioDiv);
        });
    } catch (error) {
        console.log(error);
    }
}

function seleccionarServicio(e) {
    let elemento;

    //Forzar click en el div para obtener su id
    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }
    
    //Agregar clase seleccionado
    if(elemento.classList.contains('seleccionado')){
        elemento.classList.remove('seleccionado');

        const id = parseInt(elemento.dataset.idServicio);

        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        //Construir el objeto
        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        }

        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const {servicios} = cita;

    cita.servicios = servicios.filter(servicio => servicio.id != id);
}

function agregarServicio(servicioObj) {
    const {servicios} = cita;

    cita.servicios = [...servicios, servicioObj];
}

function mostrarResumen() {
    //Destructuring
    const{nombre, fecha, hora, servicios} = cita;

    //Seleccionar el resumn
    const resumenDiv = document.querySelector('.contenido-resumen');

    //Limpia HTML previo
    while(resumenDiv.firstChild) {
        resumenDiv.removeChild(resumenDiv.firstChild);
    }

    //Validacion objeto
    //Extrae unicamente los valores | Object.values()
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de tus Servicios';
        noServicios.classList.add('invalidar-cita');

        //Agregar a resumenDiv
        resumenDiv.appendChild(noServicios);

        return;
    }

    //Mostrar el resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Tus Datos:';

    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('P');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios:';

    serviciosCita.appendChild(headingServicios)

    let cantidad = 0

    //Iterar sobre el arreglo de servicios
    servicios.forEach(servicio => {
        const {nombre, precio} = servicio;

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');
        cantidad += parseInt(totalServicio[1].trim());

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    })

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar:</span> $ ${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = (e.target.value.trim());

        //Validación
        if(nombreTexto === '') {
            mostrarAlerta('Nombre no válido', 'error')
        } else {
            const alerta = document.querySelector('.alerta');

            if(alerta){
                alerta.remove();
            }

            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta(mensaje, tipo) {
    const alertaPrevia = document.querySelector('.alerta');

    if(alertaPrevia) {
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error') {
        alerta.classList.add('error');
    }

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

function fechaChita() {
    const fechaInput = document.querySelector('#fecha');    
    fechaInput.addEventListener('input', e => {
        const dia = new Date(e.target.value).getUTCDay();

        if([0].includes(dia)) {
            //e para que no se agregue al input
            e.preventDefault();
            mostrarAlerta('Sin Servicio en Domingo', 'error');
        } else {
            cita.fecha = fechaInput.value;
        }
    })
}

function deshabilitarFechaAnterior() {
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const anio = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate();

    //Formato AAAA-MM-DD
    const fechaDeshabilitar = `${anio}-${mes < 10 ? `0${mes}` : mes}-${dia < 10 ? `0${dia}` : dia}`;

    inputFecha.min = fechaDeshabilitar;
}

function horaCita() {
    const horaInput = document.querySelector('#hora');
    horaInput.addEventListener('input', e => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':')

        if(hora[0] < 10 || hora[0] > 20 ) {
            mostrarAlerta('Hora no válida', 'error');
        } else {
            cita.hora = horaCita;
        }
    })
}