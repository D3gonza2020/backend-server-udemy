var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// Middleware
app.use(fileUpload());
// =========================================
// Metodo para subir imagenes
// =========================================
app.put('/:tipo/:id', (req, resp) => {

    var id = req.params.id;
    var tipo = req.params.tipo;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return resp.status(400).json({
            ok:false,
            mensaje:'Tipo de colección no válida',
            errors: { message: 'Los tipos de colección válidas son ' + tiposValidos.join(', ') }
        });
    }

    if(!req.files){
        return resp.status(400).json({
            ok:false,
            mensaje: 'No seleccionó nada',
            error : { message: 'Debe de seleccionar una imagen'}
        });
    }

    //Validar tamaño de las imagen
    var imgSize = req.files.imagen.size;
    if(imgSize > 500 * 1024) {// 500Kb
        
        return resp.status(413).json({  //413 -> Request Entity Too Large
            ok: false,
            size:imgSize,
            mensaje: 'Fichero demasiado grande',
            errors: { message: 'Fichero demasiado grande. Máximo 500Kb.'},
         });   
    }

    //Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];   


    //Solo éstas extensiones son aceptadas
    var extensionesValidas = ['png','jpg','gif','jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0){
        return resp.status(400).json({
            ok:false,
            mensaje:'Extensión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    //Mover el archivo del temporal a un path especifico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, resp);    
      
    });
});

// =========================================
// Funciones
// =========================================
function subirPorTipo(tipo, id, nombreArchivo, resp){

    if(tipo === 'usuarios'){

        Usuario.findById({ _id:id }, (err, usuario) => {

            if(!usuario){   
                
                var pathImgTemp = './uploads/usuarios/' + nombreArchivo;
                //Si existe elimina la img temporal
                if(fs.existsSync(pathImgTemp)){
                    fs.unlinkSync(pathImgTemp);
                }

                return resp.status(400).json({
                    ok:false,
                    message: `No existe usuario con ese Id ${ id }`,
                    Errors : { message: ' Usuario no existe'}
                });
            }

            var pathAnterior = './uploads/usuarios/' + usuario.img;

            //Si existe elimina la img anterior
            if(fs.existsSync(pathAnterior)){
                fs.unlinkSync(pathAnterior);
            }

            usuario.img = nombreArchivo;
            usuario.save( (err, usuarioActualizado) => {

                usuario.password = ':)';

                if(err){
                    return resp.status(400).json({
                        ok:false,
                        message: 'Error al actualizar la imagen del usuario',
                        Errors : err
                    });
                }

                return resp.status(200).json({
                    ok:true,
                    mensaje:'Imagen del usuario actualizada', 
                    usuario: usuarioActualizado      
                });
            });
        });
    }

    if(tipo === 'medicos'){

        Medico.findById({ _id:id }, (err, medico) => {

            if(!medico){

                var pathImgTemp = './uploads/medicos/' + nombreArchivo;
                //Si existe elimina la img temporal
                if(fs.existsSync(pathImgTemp)){
                    fs.unlinkSync(pathImgTemp);
                }

                return resp.status(400).json({
                    ok:false,
                    message: `No existe medico con ese Id ${ id }`,
                    Errors : { message: ' Médico no existe'}
                });
            }

            var pathAnterior = './uploads/medicos/' + medico.img;

            //Si existe elimina la img anterior
            if(fs.existsSync(pathAnterior)){
                fs.unlinkSync(pathAnterior);
            }

            medico.img = nombreArchivo;
            medico.save( (err, medicoActualizado) => {

                if(err){
                    return resp.status(400).json({
                        ok:false,
                        message: 'Error al actualizar la imagen del médico',
                        Errors : err
                    });
                }

                return resp.status(200).json({
                    ok:true,
                    mensaje:'Imagen del médico actualizada', 
                    medico: medicoActualizado      
                });
            });
        });        
    }

    if(tipo === 'hospitales'){

        Hospital.findById({ _id:id }, (err, hospital) => {

            if(!hospital){
                
                var pathImgTemp = './uploads/hospitales/' + nombreArchivo;
                //Si existe elimina la img temporal
                if(fs.existsSync(pathImgTemp)){
                    fs.unlinkSync(pathImgTemp);
                }

                return resp.status(400).json({
                    ok:false,
                    message: `No existe hospital con ese Id ${ id }`,
                    Errors : { message: ' Hospital no existe'}
                });
            }

            var pathAnterior = './uploads/hospitales/' + hospital.img;

            //Si existe elimina la img anterior
            if(fs.existsSync(pathAnterior)){
                fs.unlinkSync(pathAnterior);
            }

            hospital.img = nombreArchivo;
            hospital.save( (err, hospitalActualizado) => {

                if(err){
                    return resp.status(400).json({
                        ok:false,
                        message: 'Error al actualizar la imagen del hospital',
                        Errors : err
                    });
                }

                return resp.status(200).json({
                    ok:true,
                    mensaje:'Imagen del hospital actualizado', 
                    hospital: hospitalActualizado      
                });
            });
        });        
    }
}

module.exports = app;