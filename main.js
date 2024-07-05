//REFERENCIAS
const btnAgregar = document.getElementById("btnAgregar");
const btnSubmit = document.getElementById("btnSubmit");
const btnReset = document.getElementById("btnReset");
const filas = document.getElementsByTagName("tr"); //usaba para los checkbox
const formDatos = document.getElementById("contDatos");
const formAbm = document.getElementById("formABM");
const tbody = document.getElementById("tbody");
const filtroSelect = document.getElementById("filtro");
let tabla = document.getElementById("tabla");
const botonesOrden = document.querySelectorAll('.btn-order'); //botones en cabecera
const tipoSelect = document.getElementById("tipo");
const divCiudadano = document.getElementById("contenedor-Ciudadano");
const divExtranjero = document.getElementById("contenedor-Extranjero");
const tituloForm = document.getElementById("titulo-form");
let nombre = document.getElementById("nombre");
let apellido = document.getElementById("apellido");
let fechaNacimiento = document.getElementById("fechaNacimiento");
//PERSONAS
let arrayJson = [];
//SPINNER
const spinnerContainer = document.getElementById('spinner-contenedor');
let addEventListener = null;
let deleteEventListener = null;
let modificarEventListener = null;


//CLASES
class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString() {
        return "ID:" + this.id + "-Nombre:" + this.nombre + "-Apellido:" + this.apellido + "-Fecha de Nacimiento: " + this.fechaNacimiento;
    }
}
class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }
    toString() {
        return super.toString() + "DNI: " + this.dni;
    }
}
class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento)
        this.paisOrigen = paisOrigen;
    }
    toString() {
        return super.toString() + "-Pais de origen: " + this.paisOrigen;
    }
}

//OBTENER DATOS

function obtenerDatosXML() {
    spinnerContainer.style.display = "block";
    let xhttp = new XMLHttpRequest(); //Instancio el objeto
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                arrayJson = JSON.parse(xhttp.response);
                cargarArrayPersonas(arrayJson);
                cargarPersonasTabla(arrayJson);
                spinnerContainer.style.display = "none";

            } else {
                alert("Error en la solicitud - ESTADO: " + xhttp.status);
            }
            spinnerContainer.style.display = "none";
        }
    };
    setTimeout(function() {
    xhttp.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", false);
    xhttp.send(); //Envio la solicitud
    }, 100);
    
}

//AGREGAR DATOS
async function agregarPersonaFetchAsync(persona) {
    spinnerContainer.style.display = "block";
    try {
        let response = await fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjer", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(persona) //la persona va con id null
        });

        if (response.status == 200) {
            let dato = await response.json();
            persona.id = parseInt(dato.id); //obtengo el id de la api
            arrayJson.push(persona);

            limpiarTabla();
            cargarPersonasTabla(arrayJson);
            alert("Persona agregada correctamente con ID: " + persona.id);
        } else {
            throw new Error('ERROR: ' + response.statusText + ' ESTADO: ' + response.status);
        }

    } catch (error) {
        alert("Error en la solicitud de alta. Error: " + error);
    } finally {
        spinnerContainer.style.display = "none";
        ocultarFormABM();
    }

}


//ELIMINAR

//xml eliminar
function eliminarPersonaXML(idPersona) {
    spinnerContainer.style.display = "block";
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                alert("Eliminación exitosa.");
                arrayJson = arrayJson.filter(p => p.id !== idPersona); // Eliminar la persona del array
                limpiarTabla();
                cargarPersonasTabla(arrayJson);
                mostrarCamposSegunSelect();
            } else {
                alert("No se pudo eliminar a la persona. ERROR STATUS: " +xhttp.status);
            }
            ocultarFormABM();
            mostrarCamposSegunSelect();
            spinnerContainer.style.display = "none";
        }
    }
    xhttp.open("DELETE", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ id: idPersona }));
}
//MODIFICAR

function modificarPersonaFetch(persona) {
    spinnerContainer.style.display = "block";
    fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(persona)
    })
        .then(response => {
            if (response.status == 200) {
                return response.text();
            } else {
                throw new Error('No se pudo modificar la persona.'); //va al catch
            }
        })
        .then((datos) => {
            alert(datos);
            for (let i = 0; i < arrayJson.length; i++) {
                if (arrayJson[i].id === persona.id) {
                    arrayJson[i] = persona;
                    break;
                }
            }
            limpiarTabla();
            cargarPersonasTabla(arrayJson);
        })
        .catch(function (error) {
            alert(error); // Muestro alerta en caso de error
        })
        .finally(() => {
            spinnerContainer.style.display = "none";
            ocultarFormABM();
            mostrarCamposSegunSelect();
        });

}


//CARGAR ARRAY PERSONAS
function cargarArrayPersonas(array) {
    arrayJson = [];
    if (array) {
        array.forEach(objeto => {
            if (objeto.hasOwnProperty("dni")) {
                arrayJson.push(new Ciudadano(objeto.id, objeto.nombre, objeto.apellido, objeto.fechaNacimiento, objeto.dni));
            }
            else if (objeto.hasOwnProperty("paisOrigen")) {
                arrayJson.push(new Extranjero(objeto.id, objeto.nombre, objeto.apellido, objeto.fechaNacimiento, objeto.paisOrigen));
            }
        });
    } else {
        console.log("array no definido")
    }
}

//OCULTAR-MOSTRAR PANTALLA INICIO-ABM
function ocultarFormData() {
    tituloForm.textContent = "Formulario para agregar persona";
    formDatos.style.display = "none";
    formABM.style.display = "block"
    btnSubmit.style.display = "inline-block";
}
function ocultarFormABM() {
    formDatos.style.display = "block";
    formABM.style.display = "none"
    btnSubmit.style.display = "inline-block";
    deshabilitarElementos(tipoSelect, false);
    deshabilitarElementos(nombre, false);
    deshabilitarElementos(apellido, false);
    deshabilitarElementos(fechaNacimiento, false);
    deshabilitarElementos(paisOrigen, false);
    deshabilitarElementos(dni, false);
    filtroSelect.value = "todos";
    limpiarCamposABM();
}


//CARGAR PERSONAS A TABLA
function cargarPersonasTabla(personas) {
    limpiarTabla();
    let personasFiltradas = [];

    switch (filtroSelect.value) {
        case "ciudadano":
            personasFiltradas = personas.filter(persona => persona instanceof Ciudadano);
            break;
        case "extranjero":
            personasFiltradas = personas.filter(persona => persona instanceof Extranjero);
            break;
        default:
            personasFiltradas = personas;
            break;
    }

    personasFiltradas.forEach(persona => {
        const fila = document.createElement("tr");
        const btnModificar = document.createElement("button");
        const btnEliminar = document.createElement("button");
        btnModificar.innerHTML = "Modificar";
        btnModificar.className = "btn-Modificar";
        btnEliminar.innerHTML = "Eliminar";
        btnEliminar.className = "btn-Eliminar";
        btnEliminar.addEventListener("click", (e) => {
            handlerEliminarClick(e, persona)
        });
        btnModificar.addEventListener("click", (e) => {

            handleModificarClick(e, persona)
        });


        const columnas = ["id", "nombre", "apellido", "fechaNacimiento", "dni", "paisOrigen", "modificar", "eliminar"];
        columnas.forEach(columna => {
            const celda = document.createElement("td");
            if (columna == "modificar" || columna == "eliminar") {
                if (columna == "modificar") {
                    celda.appendChild(btnModificar);
                } else {
                    celda.appendChild(btnEliminar);
                }
            } else {
                if (persona[columna] !== undefined) {
                    celda.textContent = persona[columna];
                } else {
                    celda.textContent = "--";
                }
            }

            fila.appendChild(celda);
        });

        tbody.appendChild(fila);
    });

}

function deshabilitarElementos(elemento, visible) {
    elemento.disabled = visible;
}



function handleModificarClick(e, persona) {
    let personaModificada;
    e.preventDefault();
    ocultarFormData();
    cargarDatosAbm(persona);
    tituloForm.textContent = "Formulario para Modificar Persona";
    deshabilitarElementos(tipoSelect, true);
    sacarEventos();
    modificarEventListener = (event) => {
        event.preventDefault();
        if (validarDatos(nombre.value, apellido.value, fechaNacimiento.value, tipoSelect.value, dni.value, paisOrigen.value)) {
            if (tipoSelect.value == "extranjero") {
                personaModificada = new Extranjero(persona.id, nombre.value, apellido.value, fechaNacimiento.value, paisOrigen.value)
            } else {
                personaModificada = new Ciudadano(persona.id, nombre.value, apellido.value, fechaNacimiento.value, dni.value)
            }

            if (confirm("Desea modificar a esta persona?")) {
                modificarPersonaFetch(personaModificada)
            }
        }
        console.log("Modificar persona con ID:", persona.id);
    }
    btnSubmit.addEventListener("click", modificarEventListener);
}

function handlerEliminarClick(e, persona) {
    e.preventDefault();
    ocultarFormData();
    cargarDatosAbm(persona);
    tituloForm.textContent = "Formulario para Eliminar Persona";
    deshabilitarElementos(tipoSelect, true);
    deshabilitarElementos(nombre, true);
    deshabilitarElementos(apellido, true);
    deshabilitarElementos(fechaNacimiento, true);
    deshabilitarElementos(dni, true);
    deshabilitarElementos(paisOrigen, true);

    sacarEventos();
    deleteEventListener = (event) => {
        event.preventDefault();
        if (confirm("Desea eliminar a esta persona?")) {
            //eliminarPersonaFetchAsync(persona.id);
            eliminarPersonaXML(persona.id)
        }
        console.log("Eliminar persona con ID:", persona.id);

    }
    btnSubmit.addEventListener("click", deleteEventListener);
}


//FILTRO SELECT
function filtrarPersonasPorTipo(tipo) {
    switch (tipo) {
        case "ciudadanos":
            let ciudadanos = arrayJson.filter(persona => persona instanceof Ciudadano);
            return ciudadanos;
        case "extranjeros":
            let extranjeros = arrayJson.filter(persona => persona instanceof Extranjero);
            return extranjeros;
        default:
            return arrayJson;
            break;
    }
}

function filtrarPorTipo() {
    let personasFiltradas = filtrarPersonasPorTipo(filtroSelect.value);
    tbody.innerHTML = "";
    cargarPersonasTabla(personasFiltradas);
}

//CALCULAR PROMEDIO EDAD
function calcularPromedioEdad() {
    let edades = [];
    let personasFiltradas = filtrarPersonasPorTipo(filtroSelect.value); //me traigo a quienes tengo en la tabla, ya con filtro
    let labelPromedio = document.getElementById("label-promedio");

    personasFiltradas.forEach(persona => {
        const fechaNacimiento = persona.fechaNacimiento.toString();
        const añoNacimiento = parseInt(fechaNacimiento.slice(0, 4)); // con slice voy cortando los primeros 4 datos de la fecha de nacimiento que saque antes
        const edad = 2024 - añoNacimiento;
        edades.push(edad);
    });

    if (edades.length === 0) { //si me borró a todas las personas
        alert("No se puede calcular el promedio de edad. No hay personas ingresadas");
        labelPromedio.value = 0;
        return;
    } else {
        let sumaEdades = edades.reduce((total, edad) => total + edad, 0); //con reduce voy acumulando los valores y sumandolos en total (desde 0)
        let edadPromedio = sumaEdades / edades.length;
        labelPromedio.value = edadPromedio.toFixed(2);
    }


}



function limpiarTabla() {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}


//CARGAR PERSONA
function cargarPersona(nombre, apellido, fechaNacimiento, tipo, dni, paisOrigen) {

    let ultimoId = obtenerUltimoId();
    if (tipo === "ciudadano") {
        document.getElementById("contenedor-Ciudadano").style.display = "block";
        document.getElementById("contenedor-Extranjero").style.display = "none";
        arrayJson.push(new Ciudadano(ultimoId + 1, nombre, apellido, fechaNacimiento, dni));

    } else {
        document.getElementById("contenedor-Ciudadano").style.display = "none";
        document.getElementById("contenedor-Extranjero").style.display = "block";
        arrayJson.push(new Extranjero(ultimoId + 1, nombre, apellido, fechaNacimiento, paisOrigen));

    }
}


// Mostrar Campos Segun Select Vendedor - Cliente
function mostrarCamposSegunSelect() {
    if (tipoSelect.value === "ciudadano") {
        divCiudadano.style.display = "block";
        divExtranjero.style.display = "none";
    } else {
        divCiudadano.style.display = "none";
        divExtranjero.style.display = "block";
    }
}

//OBTENER Y RETORNAR ULTIMO ID
function obtenerUltimoId() {
    if (arrayJson.length === 0) {
        return 0;
    } else {
        const ids = arrayJson.map(persona => parseInt(persona.id));  //con map me traigo un array de ids
        const maxId = Math.max(...ids); //los puntos suspensivos es para pasar cada elemento del array como argumentos separados - acá busco el mas grande
        return maxId;
    }
}


//VALIDAR DATOS INGRESADOS
function validarDatos(nombre, apellido, fechaNacimiento, tipo, dni, paisOrigen) {
    if (nombre.trim() == "" || nombre.length < 3) {
        alert("Ingrese un nombre válido (más a 3 letras)");
        return false;
    }
    if (apellido.trim() == "" || apellido.length < 3) {
        alert("Ingrese un apellido válido (más de 3 letras)");
        return false;
    }
    if (parseInt(fechaNacimiento) < 19000101 || parseInt(fechaNacimiento) > 20240720 || fechaNacimiento.trim() == "") {
        alert("Ingrese una fecha de nacimiento válida, aquí el formato: aaaammdd ( desde 01 de enero de 1900 hasta el 20 de julio de 2024");
        return false;
    }

    switch (tipo) {

        case "ciudadano":
            if (isNaN(parseInt(dni)) || parseInt(dni) < 1111111) {
                alert("Ingrese un valor de dni válido (numero mayor a 1111111");
                return false;
            }
            break;
        case "extranjero":
            if (paisOrigen.trim() == "" || paisOrigen.length < 3) {
                alert("Ingrese un pais de origen valido (mas de 3 letras)");
                return false;
            }

            break;
        default:
            break;
    }
    return true;
}


//CARGAR DATOS EN ABM
function cargarDatosAbm(persona) {
    document.getElementById("id").value = persona.id;
    document.getElementById("nombre").value = persona.nombre;
    document.getElementById("apellido").value = persona.apellido;
    document.getElementById("fechaNacimiento").value = persona.fechaNacimiento;


    if (persona.hasOwnProperty("dni")) {
        document.getElementById("tipo").value = "ciudadano";
        divExtranjero.style.display = "none";
        divCiudadano.style.display = "block";
        document.getElementById("dni").value = persona.dni;

    } else {
        document.getElementById("tipo").value = "extranjero";
        divExtranjero.style.display = "block";
        divCiudadano.style.display = "none";
        document.getElementById("paisOrigen").value = persona.paisOrigen;
    }

}

function limpiarCamposABM() {
    id.value = "";
    nombre.value = "";
    apellido.value = "";
    fechaNacimiento.value = "";
    dni.value = "";
    paisOrigen.value = "";
}

function sacarEventos() {
    if (addEventListener) {
        btnSubmit.removeEventListener("click", addEventListener);
        addEventListener = null;
    }
    if (deleteEventListener) {
        btnSubmit.removeEventListener("click", deleteEventListener);
        deleteEventListener = null;
    }
    if (modificarEventListener) {
        btnSubmit.removeEventListener("click", modificarEventListener);
        modificarEventListener = null;
    }
}

window.addEventListener("load", function () {
    obtenerDatosXML();

    //FORMULARIO ABM
    formABM.addEventListener("submit", function (e) {
        e.preventDefault();
        sacarEventos(); //con esto limpio eventos anteriores

        addEventListener = (event) => {
            event.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const tipo = document.getElementById("tipo").value;
            const fechaNacimiento = document.getElementById("fechaNacimiento").value;
            const dni = document.getElementById("dni").value;
            const paisOrigen = document.getElementById("paisOrigen").value;

            deshabilitarElementos(tipoSelect, false);
            btnSubmit.style.display = "inline-block";

            if (!validarDatos(nombre, apellido, fechaNacimiento, tipo, dni, paisOrigen)) {
                return;
            }
            let persona;
            if (tipo === "ciudadano") {
                persona = new Ciudadano(null, nombre, apellido, fechaNacimiento, dni);
            } else {
                persona = new Extranjero(null, nombre, apellido, fechaNacimiento, paisOrigen);
            }
            agregarPersonaFetchAsync(persona);
        }

        btnSubmit.addEventListener("click", addEventListener)

    });

    //BOTONES
    btnReset.addEventListener("click", ocultarFormABM);
    btnAgregar.addEventListener("click", function () {
        sacarEventos();
        ocultarFormData();
    });

    //FILTRO
    filtroSelect.addEventListener("change", filtrarPorTipo);
    tipoSelect.addEventListener("change", mostrarCamposSegunSelect); // event listener para el cambio en el select

});
