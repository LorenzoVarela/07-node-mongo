const express = require('express');
const bcryptr = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');


const app = express();

app.get('/usuario', verificaToken, (req, res) => {

    let pagina = req.query.limite || 5;
    pagina = Number(pagina);

    let desde = req.query.desde || 0;
    desde = Number(desde);


    Usuario.find({ estado: true }, 'nombre email role estodo google img')
        .skip(desde)
        .limit(pagina)
        .exec((err, usuarios) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                });
            }

            // número de registros

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            })

        });

});

app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptr.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        console.log(err);
        if (err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;


        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });


});

app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });




});

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    //let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // eliminación lógica
    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, (err, usuarioBorrado) => {
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });

        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });



});


//app.delete('/usuario/:id', function(req, res) {
//
//    let id = req.params.id;
//
//    // eliminación física
//    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//        if (err) {
//            return res.status(400).json({
//                ok: false,
//                err
//            });
//        };
//
//        if (!usuarioBorrado) {
//            return res.status(400).json({
//                ok: false,
//                err: {
//                    message: 'Usuario no encontrado'
//                }
//            });
//
//        }
//
//        res.json({
//            ok: true,
//            usuario: usuarioBorrado
//        });
//
//    });
//
//
//});



module.exports = app;