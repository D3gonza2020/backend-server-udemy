var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


// =========================================
// Obtener todos los usuarios
// =========================================
app.get('/', (req, resp, next) => {

    Usuario.find({}, 'nombre email img role')
           .exec(
                (err, usuarios) => {

                    if(err){
                        return resp.status(500).json({
                            ok:false,
                            mensaje:'Error cargando usuarios',
                            errors: err
                        });
                    }
        
                    resp.status(200).json({
                        ok:true,
                        usuarios: usuarios
                    });
                })    

});

// =========================================
// Actualizar un nuevo usuario
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( { _id: id}, (err, usuario) => {         

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errors: err
            });
        }

        if( !usuario ){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe un usuario con el id ${ id }`,
                errors: { message: 'No existe un usuario con ese Id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;  
        
        usuario.save( (err, usuarioGuardado) => {
           
            if( err ){
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ":)";

            resp.status(200).json({
                ok:true,
                usuario: usuarioGuardado
            });
        });

    });
});

// =========================================
// Crear un nuevo usuario
// =========================================
app.post('/', mdAutenticacion.verificaToken , (req, resp) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre:  body.nombre,
        email:   body.email,
        password: bcrypt.hashSync(body.password, 10),
        img:  body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {

        if(err){
            return resp.status(400).json({
                ok:false,
                mensaje:'Error al crear usuario',
                errors: err
            });
        }

        resp.status(201).json({
            ok:true,
            usuarios: usuarioGuardado,
            usuarioToken:req.usuario
        });
    });   

});

// =========================================
// Borrar un nuevo usuario por el Id
// =========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var id = req.params.id;

    Usuario.findOneAndDelete({ _id: id}, (err, usuarioBorrado) => {

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe un usuario con el id ${ id }`,
                errors: { message: 'No existe un usuario con ese Id' }
            });
        }

        resp.status(200).json({
            ok:true,
            usuarios: usuarioBorrado
        });

    })
})

module.exports = app;