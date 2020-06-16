//Importamos la libreria de mongoose
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

//funcion para definir esquemas
var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({

    nombre: { type:String, required: [true, 'El nombre es necesario'] },
    email: { type:String, unique:true, required: [true, 'El correo es necesario'] },
    password: { type:String, required: [true, 'El password es necesario'] },
    img: { type:String, required: false },
    role: { type:String, required: true, default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único'});

//Para poder utilizar el esquema creado fuera de
//este archivo debemos exportarlo
module.exports = mongoose.model('Usuario', usuarioSchema);