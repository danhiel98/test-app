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
        this.seedContratos();
    }

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
                    numero: data.numero
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
                    this.refIps.add({
                        red: redes[i].numero,
                        numero: j
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
                let cliente = {
                    dui: faker.random.word(),
                    nombre: faker.name.firstName(),
                    apellido: faker.name.lastName(),
                    direccion: `${faker.address.city()} ${faker.address.direction()}`,
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                }

                this.refClientes.add(cliente)
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
                });
            });
        });

        console.log(redes);
        console.log(ips);
        console.log(clientes);

        console.log('Agregando contratos');
        return new Promise((resolve, reject) => {
            for (let i = 1; i <= 25; i++){
                let red = redes[faker.random.number(0, redes.length)];
                let ip = ips[faker.random.number(0, ips.length)]
                let cliente = clientes[faker.random.number(0, clientes.length)];

                let contrato = {
                    activo: true,
                    cliente: '',
                    codigo: '',
                    red: '',
                    ip: '',
                    fecha_ingreso: '',
                    fecha_inicio: '',
                    fecha_fin: '',
                    precio_cuota: '',
                    velocidad: '',
                    ref_cliente: ''
                }

                this.refContratos.add(contrato)
                .then(doc => {
                    if (i === 25) {
                        resolve('contratos insertados');
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