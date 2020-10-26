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
    }

    zeroPad = (num, places) => String(num).padStart(places, '0');

    seedRedes = () => {
        console.log('Agregando redes');
        return new Promise((resolve, reject) => {
            for (let i = 14; i < 16; i++){
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
                let dui = faker.random.word();
                let cliente = {
                    dui,
                    nombre: faker.name.firstName(),
                    apellido: faker.name.lastName(),
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
                let fecha_inicio = faker.date.past(faker.random.number({min: 0, max: 5}), new Date());
                let fecha_fin = new Date(fecha_inicio);
                fecha_fin.setMonth(fecha_fin.getMonth() + 16)

                let mes_inicio = fecha_inicio.getMonth() + 1;
                let mes_fin = fecha_fin.getMonth() + 1;

                let f_inicio = `${this.zeroPad(mes_inicio, 2)}${fecha_inicio.getFullYear().toString().substr(-2)}`;
                let f_fin = `${this.zeroPad(mes_fin, 2)}${fecha_fin.getFullYear().toString().substr(-2)}`;

                let contrato = {
                    activo: true,
                    cliente: `${cliente.nombre} ${cliente.apellido}`,
                    codigo: `R${red.numero}-${ip.numero}-${f_inicio}-${f_fin}`,
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
                    for (let i = 1; i <= 18; i++) {
                        let cuota = {
                            codigo: `${contrato.codigo}-${this.zeroPad(i, 2)}`,
                            cantidad: contrato.precio_cuota,
                            fecha_pago: new Date(fecha_pago.setMonth(fecha_pago.getMonth() + i === 1 ? 0 : 1)),
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

    clearData = () => {
        let pRedes = this.rollback(this.refRedes);
        let pIps = this.rollback(this.refIps);
        let pClientes = this.rollback(this.refClientes);
        let pContratos = this.rollback(this.refContratos);
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

    rollback = ref => {
        console.log(`Eliminando ${ref.path}`);
        return new Promise((resolve, reject) => {
            ref.get()
            .then(querySnapshot => {
                querySnapshot.forEach(function(doc) {
                    ref.doc(doc.id).delete(); // Eliminar el elemento encontrado
                });

                resolve('Ok');
            });
        })
    }

    render() {
        return (
            <>
                <button onClick={this.clearData}>Clear data</button>
                <button onClick={this.makeData}>Create data</button>
            </>
        );
    }
}

export default Seed;
