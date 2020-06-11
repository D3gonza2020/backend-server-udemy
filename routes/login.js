var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('./config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, resp) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioLogin) => {

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioLogin){
            return resp.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectas - email',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioLogin.password)){
            return resp.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectas - password',
                errors: err
            });
        }

        //Crear un token!!!
        usuarioLogin.password = ':)';
        var token = jwt.sign( { usuario: usuarioLogin }, SEED, 
                              { expiresIn: 14400 });        


        resp.status(200).json({
            ok:true,
            usuario:usuarioLogin,
            token: token,
            id:usuarioLogin.id
        });
    
    })    
});


module.exports = app;