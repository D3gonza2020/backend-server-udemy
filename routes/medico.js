var express = require('express');

var mdAutentication = require('../middlewares/autenticacion');

var app= express();

var Medico = require('../models/medico');

// =========================================
// Obtener todo los medicos
// =========================================
app.get('/', (req, resp) => {

    var desde = req.query.desde;
    desde = Number(desde);

    Medico.find({})
          .skip(desde)
          .limit(5)
          .populate('usuario','nombre email')
          .populate('hospital')
          .exec(
            (err, medicos) => {

                if(err){
                    return resp.status(500).json({
                        ok:false,
                        mensaje: 'Error al cargar los médicos',
                        errors:err
                    });
                }

                Medico.count({}, (err,conteo) => {   
                                     
                    resp.status(200).json({
                        ok:true,
                        medicos:medicos,
                        total:conteo
                    });
                });
            });
});

// =========================================
// Crear nuevo médico
// =========================================
app.post('/', mdAutentication.verificaToken, (req, resp) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,      
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {

        if(err){
            return resp.status(400).json({
                ok:false,
                mensaje:'Error al crear un nuevo médico',
                errors:err
            });
        }

        resp.status(201).json({
            ok:true,
            medico:medicoGuardado
        });
    });
});

// =========================================
// Actualizar médico
// =========================================
app.put('/:id', mdAutentication.verificaToken, (req, resp) => {

    var id = req.params.id;
    var body = req.body;

    //Buscar el medico del Id enviado
    Medico.findById({_id:id}, (err, medico) => {

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al buscar médico',
                errors:err
            });
        }

        if(!medico){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe médico con el Id ${id}`,
                errors: {message:'No existe médico con ese Id'}
            });
        }

        //Actualizamos los datos
        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        //Ahora guardamos los nuevos datos
        medico.save((err, medicoGuardado) =>{

            if(err){
                return resp.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar médico',
                    errors:err
                });
            }

            resp.status(200).json({
                ok:true,
                medico:medicoGuardado
            });
        });
    });

});

// =========================================
// Eliminar medico por Id
// =========================================
app.delete('/:id', mdAutentication.verificaToken, (req, resp) => {

    var id= req.params.id;

    Medico.findOneAndRemove({_id:id}, (err, medicoBorrado) => {

        if(err){
            return resp.status(500).json({
                ok:false,
                message:'Error al borrar médico',
                errors: err
            });
        }

        if(!medicoBorrado){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe médico con el Id ${id}`,
                errors: { message:'No existe médico con el ese Id'}
            });
        }

        resp.status(200).json({
            ok:true,
            medico:medicoBorrado
        });
    });
});

module.exports = app;