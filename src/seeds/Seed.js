import React, { Component } from 'react';
import faker from 'faker';
import app from '../firebaseConfig';
import firebase from 'firebase';
// faker.locale = 'es_MX';

class Seed extends Component
{
    constructor(props) {
        super(props);
        this.name = faker.fake("{{name.firstName}} {{name.lastName}}");

        this.firestore = app.firestore();

        this.refRedes = this.firestore.collection('redes');
        this.refIps = this.firestore.collection('ips');
        this.refClientes = this.firestore.collection('clientes');
        this.refContratos = this.firestore.collection('contratos');
        this.refPagos = this.firestore.collection('pagos');
        this.refMantenimientos = this.firestore.collection('mantenimientos');
        this.refFacturas = this.firestore.collection('facturas');

        this.state = {
            redes: [],
            ips: [],
            clientes: [],
            contratos: [],
            pagos: []
        }
    }

    componentDidMount() {
        console.log('Componente cargado');
    }

    makeData = () => {
        // this.seedRedes();
        // this.seedIps();
        // this.seedCientes();
        // this.seedContratos();
        // this.seedMantenimientos();
        this.seedFacturas();
    }

    setAvailableIPs = async () => {
        await this.refIps.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                doc.ref.update({
                    libre: true
                })
            });
        })
        .catch(function(error) {
            console.log("Error actualizando las redes: ", error);
        });
    }

    zeroPad = (num, places) => String(num).padStart(places, '0');

    seedRedes = () => {
        console.log('Agregando redes');
        return new Promise((resolve, reject) => {
            for (let i = 14; i < 22; i++){
                this.refRedes.add({
                    numero: i
                })
                .then(doc => {
                    if (i === 15) {
                        resolve('Redes insertadas');
                    }
                })
                .catch((error) => {
                    reject(error);
                });
            }
        })
    }

    seedIps = async () => {
        let redes = [];
        console.log('Agregando IPs');

        await this.refRedes.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                redes.push({
                    id: doc.id,
                    numero: data.numero,
                });
            });
        })
        .catch(function(error) {
            console.log("Error obteniendo documentos: ", error);
        });

        if (!redes.length) return;

        return new Promise((resolve, reject) => {
            for (let i = 0; i < redes.length; i++) {
                for (let j = 1; j < 254; j++) {
                    this.refIps.doc(`${redes[i].numero}-${j}`).set({
                        red: redes[i].numero,
                        numero: j,
                        libre: faker.random.boolean()
                    })
                    .then(doc => {
                        if (redes.length === 2) {
                            resolve('Direcciones IP insertadas')
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
                }
            }
        })
    }

    seedCientes = ()  => {
        console.log('Agregando clientes');
        return new Promise((resolve, reject) => {
            for (let i = 1; i <= 25; i++){
                let dui = faker.phone.phoneNumber('0#######-#');
                let cliente = {
                    dui,
                    fecha_eliminado: null,
                    nombre: faker.name.firstName(),
                    apellido: faker.name.lastName(),
                    telefono: faker.phone.phoneNumber('####-####'),
                    direccion: `${faker.address.city()} ${faker.address.direction()}`,
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                }

                this.refClientes.doc(dui).set(cliente)
                .then(doc => {
                    if (i === 25) {
                        resolve('Clientes insertados');
                    }
                })
                .catch((error) => {
                    reject(error);
                });
            }
        })
    }

    seedContratos = async () => {
        let redes = [];
        let ips = [];
        let clientes = [];

        await this.refRedes.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                redes.push({
                    id: doc.id,
                    numero: data.numero
                });
            });
        });

        await this.refIps.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                ips.push({
                    id: doc.id,
                    red: data.red,
                    numero: data.numero
                });
            });
        });

        await this.refClientes.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                clientes.push({
                    id: doc.id,
                    dui: data.dui,
                    nombre: data.nombre,
                    apellido: data.apellido,
                    ref: doc.ref
                });
            });
        });

        return new Promise((resolve, reject) => {
            for (let i = 1; i <= 25; i++){
                let red = redes[faker.random.number({min: 0, max: redes.length - 1})];
                let ip = ips[faker.random.number({min: 0, max: ips.length - 1})]
                let cliente = clientes[faker.random.number({min: 0, max: clientes.length - 1})];
                let dui_cliente = cliente.dui;
                let fecha_inicio = faker.date.past(faker.random.number({min: 0, max: 5}), new Date());
                let fecha_fin = new Date(fecha_inicio);
                fecha_fin.setMonth(fecha_fin.getMonth() + 17)

                let mes_inicio = fecha_inicio.getMonth() + 1;
                let mes_fin = fecha_fin.getMonth() + 1;

                let f_inicio = `${this.zeroPad(mes_inicio, 2)}${fecha_inicio.getFullYear().toString().substr(-2)}`;
                let f_fin = `${this.zeroPad(mes_fin, 2)}${fecha_fin.getFullYear().toString().substr(-2)}`;

                let contrato = {
                    activo: true,
                    archivado: false,
                    fecha_eliminado: null,
                    cliente: `${cliente.nombre} ${cliente.apellido}`,
                    codigo: `R${red.numero}-${this.zeroPad(ip.numero, 3)}-${f_inicio}-${f_fin}`,
                    cant_cuotas: 18,
                    dui_cliente,
                    red: red.numero,
                    ip: ip.numero,
                    fecha_ingreso: firebase.firestore.FieldValue.serverTimestamp(),
                    fecha_inicio,
                    fecha_fin,
                    precio_cuota: faker.random.float({min: 15, max: 60}),
                    velocidad: faker.random.number({min: 1, max: 50}),
                    ref_cliente: cliente.ref,
                }

                this.refContratos.doc(`${contrato.codigo}`).set(contrato)
                .then(() => {
                    let fecha_pago = new Date(fecha_inicio);
                    fecha_pago.setMonth(fecha_pago.getMonth() - 1)
                    for (let i = 1; i <= 18; i++) {
                        let cuota = {
                            codigo: `${contrato.codigo}-${this.zeroPad(i, 2)}`,
                            cantidad: contrato.precio_cuota,
                            fecha_pago: new Date(fecha_pago.setMonth(fecha_pago.getMonth() + 1)),
                            cancelado: false
                        }

                        this.refContratos.doc(`${contrato.codigo}`).collection('cuotas').doc(`${this.zeroPad(i, 2)}`).set(cuota);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
            }
        })
    }

    seedPagos = () => {

    }

    seedMantenimientos = async () => {
        let contratos = [];

        console.log('Agregando mantenimientos');


        await this.refContratos.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                contratos.push({
                    id: doc.id,
                    codigo: data.codigo,
                    cliente: data.cliente,
                    ref_cliente: data.ref_cliente,
                    ref: doc.ref
                });
            });
        });

        return new Promise((resolve, reject) => {
            for (let i = 1; i <= 10; i++){
                let contrato = contratos[faker.random.number({min: 0, max: contratos.length - 1})];

                let mantto = {
                    fecha: faker.date.past(0, new Date()),
                    fecha_eliminado: null,
                    codigo_contrato: contrato.codigo,
                    nombre_cliente: contrato.cliente,
                    ref_cliente: contrato.ref_cliente,
                    direccion: `${faker.address.city()} ${faker.address.direction()}`, // Cuando se ingrese el valor verdadero se debe obtener del cliente
                    motivo: faker.lorem.words(),
                    descripcion: faker.lorem.paragraph(),
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                }

                this.refMantenimientos.add(mantto)
                .then(doc => {
                    if (i === 10) resolve('Mantenimientos insertados');
                })
                .catch((error) => {
                    reject(error);
                });
            }
        })
    }

    seedFacturas = async () => {
        let contratos = [];

        console.log('Agregando facturas');

        await this.refContratos.get()
        .then(querySnapshot => {
            querySnapshot.forEach(function(doc) {
                let data = doc.data();

                contratos.push({
                    id: doc.id,
                    codigo: data.codigo,
                    cliente: data.cliente,
                    ref_cliente: data.ref_cliente,
                    ref: doc.ref
                });
            });
        });

        return new Promise((resolve, reject) => {
            for (let i = 1; i <= 10; i++){
                let contrato = contratos[faker.random.number({min: 0, max: contratos.length - 1})];

                let factura = {
                    fecha: faker.date.past(0, new Date()),
                    fecha_eliminado: null,
                    codigo_contrato: contrato.codigo,
                    nombre_cliente: contrato.cliente,
                    ref_cliente: contrato.ref_cliente,
                    direccion: `${faker.address.city()} ${faker.address.direction()}`, // Cuando se ingrese el valor verdadero se debe obtener del cliente
                    motivo: faker.lorem.words(),
                    descripcion: faker.lorem.paragraph(),
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                }

                this.refFacturas.add(factura)
                .then(doc => {
                    if (i === 10) resolve('Facturas ingresadas');
                })
                .catch((error) => {
                    reject(error);
                });
            }
        })
    }

    clearData = () => {
        let pRedes = this.rollback(this.refRedes);
        let pIps = this.rollback(this.refIps);
        let pClientes = this.rollback(this.refClientes);
        let pContratos = this.rollback(this.refContratos, 'cuotas');
        let pPagos = this.rollback(this.refPagos);

        console.log('Estamos eliminando la info');
        return new Promise((resolve, reject) => {
            Promise.all([pRedes, pIps, pClientes, pContratos, pPagos])
            .then(values => {
                console.log('Se terminó de eliminar la info');
                resolve(values);
            })
            .catch(error => {
                reject(error);
            })
        })
    }

    rollback = (ref, subRef) => {
        console.log(`Eliminando ${ref.path}`);
        return new Promise((resolve, reject) => {
            ref.get()
            .then(querySnapshot => {
                querySnapshot.forEach(function(doc) {
                    if (subRef) {
                        ref.doc(doc.id).collection(subRef)
                        .get()
                        .then(qs => {
                            qs.forEach(dc => {
                                ref.doc(doc.id).collection(subRef).doc(dc.id).delete();
                            })
                        })
                    }

                    ref.doc(doc.id).delete(); // Eliminar el elemento encontrado
                });

                resolve('Ok');
            });
        })
    }

    render() {
        return (
            <>
                <button onClick={this.makeData}>Make data</button>
                <button onClick={this.clearData}>Clear data</button>
                <button onClick={this.setAvailableIPs}>Set Available IPs</button>
            </>
        );
    }
}

export default Seed;
