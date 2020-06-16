var express = require('express');
var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// =========================================
// Búsqueda por coleccion
// =========================================
app.get('/coleccion/:tabla/:busqueda', (req, resp) =>{

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch(tabla){

        case 'usuarios':
            promesa = buscarUsuarios(regex); 
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        
        default:
            resp.status(400).json({
                ok:false,
                mensaje:'Los tipos de búsqueda sólo son: usuarios, médicos y hospitales',
                errors: { message: 'Tipo de tabla/colección no válido'}
            });
    }

    promesa.then( data => {

        resp.status(200).json({
            ok:true,
            [tabla]: data
        });
    });

});

// =========================================
// Búsqueda general
// =========================================
app.get('/todo/:busqueda', (req,resp) =>{

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then( respuestas => {

            resp.status(200).json({
                ok:true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
    });

});

function buscarHospitales( regex ){

    return new Promise(( resolve, reject) => {
        
        Hospital.find({ nombre:regex })
                .populate('usuario','nombre email')
                .exec(
                    (err, hospitales) =>{
                
                        if(err){
                            reject('Error al cargar hospitales', err);
                        }else{
                            resolve(hospitales)
                        }
                    });
    });
}

function buscarMedicos(regex){

    return new Promise( (resolve,reject) => {

        Medico.find({ nombre:regex})
              .populate('usuario','nombre email')
              .populate('hospital')
              .exec(
                (err, medicos) => {

                if(err){
                    reject('Error al cargar médicos', err);
                }else{
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex){

    return new Promise( (resolve, reject) =>{

        Usuario.find( {}, 'nombre email role')
                .or([ {'nombre': regex }, {'email': regex}])
                .exec( (err, usuarios) => {

                    if(err){
                        reject('Error al cargar usuarios', err);
                    }else{
                        resolve(usuarios);
                    }
                });
    });
}


module.exports = app;