var express = require('express');

//Middleware para verificar el Token
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// =========================================
// Obtener todos los hospitales
// =========================================
app.get('/', (req, resp, next) => {

    var desde = req.query.desde;
    desde = Number(desde);

    Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .exec(            
            (err, hospitales ) => {
                if(err){
                    return resp.status(500).json({
                        ok:false,
                        mensaje:'Error al cargar los hospitales',
                        errors:err
                    });
                }

                Hospital.count({}, (err,conteo) => {
                    
                    resp.status(200).json({
                        ok:true,
                        hospitales:hospitales,
                        total:conteo
                    });
                });
            });
});

// =========================================
// Crear nuevo hospital
// =========================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    
    var body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,      
        usuario:req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if(err){
            return resp.status(400).json({
                ok:false,
                mensaje:'Error al crear hospital',
                error:err
            });
        }

        resp.status(201).json({
            ok:true,
            hospital:hospitalGuardado
        });
    });
});

// =========================================
// Acualizar hospital por Id
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp) => {

    var body = req.body;
    var id   = req.params.id;

    Hospital.findById({_id:id}, (err, hospital) =>{

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al buscar hospital',
                errors: err
            });
        }

        if(!hospital){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe hospital con el id ${ id }`,
                errors: { message: 'No existe hospital con ese Id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if(err){
                return resp.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar hospital',
                    errors:err
                });
            }

            resp.status(200).json({
                ok:true,
                hospital:hospitalGuardado
            });
        });

    });
});

// =========================================
// Borrar hospital por Id
// =========================================
app.delete('/:id',mdAutenticacion.verificaToken, (req,resp) => {

    var id = req.params.id; 

    Hospital.findOneAndRemove({_id: id}, (err, hospitalBorrado) => {

        if(err){
            return resp.status(500).json({
                ok:false,
                mensaje:'Error al borrar hospital',
                errors:err
            });
        }

        if(!hospitalBorrado){
            return resp.status(400).json({
                ok:false,
                mensaje:`No existe hospital con el id ${id}`,
                errors:{ message: 'No existe hospital con ese Id'}
            });
        }

        resp.status(200).json({
            ok:true,
            hospital:hospitalBorrado
        });

    });
});

module.exports = app;