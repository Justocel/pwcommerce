/*
variables
constantes
arrays
objetos
arrays de objetos
operadores logicos, aritmeticos
if
for
funciones: expresadas, declaradas, flecha
metodos de arrays: map, filter, find, reduce
*/

// Variable: espacio en memoria para almacenar un valor que puede cambiar a lo largo del tiempo
let nombre = "Justo";
let altura = 1.75;
const edad = 21;
//var es global,let es local 
//en python
//string,number,boolean
//javascript existe en la web, no necesita compilacion 
console.log(nombre);
alert("Hola " + nombre); // concatenacion
const array = [1, 2, 3, 4, 5];
// equivalente a la lista de python
console.log(array[1]);
// el array sigue siendo constante, los elementos pueden cambiar
// lo unico que no se puede es cambiarlo a variable
// buena practica que sean constantes
// los diccionarios en javascript se llaman objetos
let ayudante = {
    nombre: "R2D2",
    tipo: "droide",
    date: "11/06/2024",
    funcion: function () {
        if (date == '11/06/2024') {
            return "Feliz cumpleaños Justo!";
        }
    }
}

// se puede crear un array de objetos
//console.table(ayudante);
//console.log(ayudante.funcion());
const arrayDeObjetos = [ayudante];
console.log(arrayDeObjetos[0].nombre); // accediendo al nombre del primer objeto en el array
// operadores logicos: &&, ||, !
// operadores aritmeticos: +, -, *, /, %
// no se puede operar un string  
// el + concatena y tiene prioridad
// el resto de las operaciones operan igual
// cuando vamos a bajo nivel (tipado debil)
// representar un numero decimal en binario

//operadores logicos
//comparacion
console.log(5 > 3); // true
console.log(5 < 3); // false
console.log(5 == 5); // true   
// comparacion estricta, compara valor y tipo
console.log(5 === "5"); // false 
console.log(5 != 3); // true
console.log(5 !== "5"); // true
//potencia
console.log(2 ** 3); // 8 =-
//logicos
console.log(true && false); // false
console.log(true || false); // true
console.log(!true); // false

// truthy y falsy
// en javascript, ciertos valores se consideran "truthy" o "falsy" cuando se evalúan en un contexto booleano
// valores falsy: false, 0, "", null, undefined, NaN
// valores truthy: cualquier valor que no sea falsy, como "0", "false", [], {}, etc.
if (0) {
    console.log("Esto no se ejecuta porque 0 es falsy");
} else {
    console.log("Esto se ejecuta porque 0 es falsy");
}

// if
let numero = 10;
if (numero > 5) {
    console.log("El numero es mayor que 5");
}

if (numero > 5 || numero < 15) {
    console.log("El numero es mayor que 5 o menor que 15");
} else if (numero === 10) {
    console.log("El numero es exactamente 10");
} else {
    console.log("El numero es menor o igual a 5");


}

// if ternario
let resultado = numero > 5 ? "Mayor que 5" : "Menor o igual a 5";
console.log(resultado);
// switch case
let dia = "Lunes";
switch (dia) {
    case "Lunes":
        console.log("Hoy es lunes");
        break;
    case "Martes":
        console.log("Hoy es martes");
        break;
    default:
        console.log("Hoy no es lunes ni martes");
        break;
}
//for variable de iteracion, condicion, incremento
for (let i = 0; i < 5; i++) {
    console.log(i);
}

function saludar(nombre) {
    alert("Hola " + nombre);
}

// funcion expresada
const despedir = function (nombre) {
    alert("Adios " + nombre);
}

let multiplicar = (a, b) => a * b; // funcion flecha
console.log(multiplicar(2, 3)); // 6

// javascript es compilado 
// recorre todo el codigo, prepara y luego ejecuta

//las funciones expresadas no pueden ser llamadas antes de su definicion, a diferencia de las funciones declaradas que si pueden ser llamadas antes de su definicion debido al hoisting.
//funcion flecha
let sumar = (a, b) => a + b;

//que pasa con los arrrays 
//metodos
//push,reverse,pop,shift,unshift
//shift eñimina el primer elemento del array
//unshift agrega un elemento al inicio del array
//map, filter, find, reduce
//sort ordena el array 
//slice corta desde un indice hasta otro y devuelve un nuevo array
//splice corte desde un indice elimina y agrega elementos
//map aplica funcion a cada i del array y devuelve un nuevo array
const productos = [
    { nombre: "Producto 1", precio: 10 },
    { nombre: "Producto 2", precio: 20 },
    { nombre: "Producto 3", precio: 30 }
];

function aumentar(porcentaje) {
    productos.map(function(producto) {
        producto.precio = producto.precio + producto.precio * (1 + porcentaje / 100);
        return producto;
    });
}

//el ultimo indice de lastindexof
//indexof devuelve el primer indice 
//for each no devuelve nada, solo itera
//find devuelve el primer elemento que cumple la condicion
//reduce reduce a un valor un array

