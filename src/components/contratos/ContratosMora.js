import React, { Component } from "react";
import {
    message,
    Modal,
    Tooltip,
    Badge,
    Space,
    PageHeader,
    Input,
    Button,
} from "antd";
import {
    ExclamationCircleOutlined,
    DeleteOutlined,
    CloudDownloadOutlined,
} from "@ant-design/icons";
import app from "../../firebaseConfig";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Tabla from "../Tabla";
import ModalDetalle from "./ModalDetalle";
import ModalDetalleCliente from "../clientes/ModalDetalle";
import Contrato from "../reportes/Contrato";
import { pdf } from "@react-pdf/renderer";
import firebase from 'firebase';
import moment from 'moment';

const { confirm } = Modal;
const { Search } = Input;

const opcFecha = { year: "numeric", month: "short" };

const cFecha = (fecha) => {
    if (fecha) return fecha.toDate();
    else return new Date();
}

const formatoDinero = (num) => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD",}).format(num);

const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const verFecha = (fecha) => {
    return capitalize(fecha.toDate().toLocaleDateString("es-SV", opcFecha));
};

class Contratos extends Component {
    constructor(props) {
        super(props);

        this.mainRef = app.firestore();
        this.refContratos = this.mainRef.collection("contratos");
        this.refClientes = this.mainRef.collection("clientes");
        this.refRedes = this.mainRef.collection("redes");
        this.refPagos = this.mainRef.collection("pagos");
        this.refMantenimientos = this.mainRef.collection("mantenimientos");

        this.unsubscribe = null;
        this.state = {
            loading: true,
            registro: null,
            contratos: [],
            clientes: [],
            redes: [],
            modalDetalle: false,
            modalDetalleCliente: false,
            codigoCliente: null,
        };
    }

    obtenerContratos = (querySnapshot) => {
        const contratos = [];
        const { busqueda } = this.state;

        querySnapshot.forEach(async (doc) => {
            let {
                cliente,
                dui_cliente,
                estado,
                codigo,
                fecha_inicio,
                fecha_fin,
                velocidad,
                cant_cuotas,
                precio_cuota,
                red,
                ip,
                ref_cliente,
                fecha_ingreso,
                ultimo_mes_pagado
            } = doc.data();

            fecha_inicio = verFecha(fecha_inicio);
            fecha_fin = verFecha(fecha_fin);

            if (
                busqueda &&
                cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_inicio.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_fin.toLowerCase().indexOf(busqueda) === -1 &&
                verFecha(ultimo_mes_pagado).toLowerCase().indexOf(busqueda) === -1
            )
                return;

            contratos.push({
                key: doc.id,
                cliente,
                dui_cliente,
                codigo,
                estado,
                fecha_inicio,
                fecha_fin,
                velocidad,
                cant_cuotas,
                precio_cuota,
                red,
                ip,
                ref_cliente,
                fecha_ingreso,
                ultimo_mes_pagado
            });
        });
        this.setState({
            contratos,
            loading: false,
        });
    };

    obtenerRedes = (querySnapshot) => {
        const redes = [];

        querySnapshot.forEach((doc) => {
            let { numero } = doc.data();

            redes.push({
                key: doc.id,
                numero: numero,
            });
        });

        this.setState({
            redes,
        });
    };

    obtenerClientes = (querySnapshot) => {
        const clientes = [];

        querySnapshot.forEach((doc) => {
            let { dui, nombre, apellido } = doc.data();

            clientes.push({
                key: doc.id,
                dui,
                nombre,
                apellido,
            });
        });

        this.setState({
            clientes,
        });
    };

    componentDidMount() {
        this.unsubscribe = this.refContratos
            .where('ultimo_mes_pagado', '<', firebase.firestore.Timestamp.now())
            .orderBy('ultimo_mes_pagado', 'desc')
            .onSnapshot(this.obtenerContratos);
        this.refClientes
            .orderBy('fecha_creacion', 'desc')
            .onSnapshot(this.obtenerClientes);
        this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    componentDidUpdate(prevState, newState) {}

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true });
            this.setState({ busqueda: valor.toLowerCase() });
            this.refContratos
                .where('ultimo_mes_pagado', '<', firebase.firestore.Timestamp.now())
                .orderBy('ultimo_mes_pagado', 'desc')
                .get()
                .then((querySnapshot) => this.obtenerContratos(querySnapshot));
        }
    }

    handleCancel = () => {
        this.setState({
            modalDetalle: false,
            modalDetalleCliente: false,
        });
    };

    irA = (ruta) => {
        this.unsubscribe();
        this.props.dispatch(push(`contratos/${ruta}`));
    };

    verDetalle = (record) => {
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    };

    verDetalleCliente = (record) => {
        this.setState({ codigoCliente: record.ref_cliente.id });
        this.setState({ modalDetalleCliente: true });
    };

    download = async (record) => {
        let cliente = null;
        await record.ref_cliente.get()
        .then(doc => cliente = doc.data())
        .catch(error => {
            message.error('¡Ocurrió un error al obtener la información del cliente!')
        })

        if (!cliente) return;

        pdf(Contrato({ contrato: record, cliente: cliente }))
            .toBlob()
            .then((file) => {
                var csvURL = window.URL.createObjectURL(file);
                let tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute(
                    "download",
                    `Contrato ${record.codigo}.pdf`
                );
                tempLink.click();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: "Contrato",
                key: "contrato",
                sorter: {
                    compare: (a, b) => a.red.toString().localeCompare(b.red.toString())
                },
                filters: [],
                onFilter: (value, record) => record.codigo.indexOf(value) === 0,
                render: (record) => (
                    <Button type="link" onClick={() => this.verDetalle(record)}>
                        <strong>{record.codigo}</strong>
                    </Button>
                ),
            },
            {
                title: "Cliente",
                key: "cliente",
                sorter: {
                    compare: (a, b) => a.cliente.localeCompare(b.cliente),
                },
                render: (record) => (
                    <Button
                        type="link"
                        onClick={() => this.verDetalleCliente(record)}
                    >
                        <strong>{record.cliente}</strong>
                    </Button>
                ),
            },
            {
                title: "Velocidad",
                key: "velocidad",
                sorter: {
                    compare: (a, b) => a.velocidad.toString().localeCompare(b.velocidad.toString())
                },
                filters: [],
                onFilter: (value, record) => record.velocidad === value,
                render: (record) => (
                    <>
                        <Badge
                            count={`${record.velocidad} Mb`}
                            style={{ backgroundColor: "#52c41a" }}
                        />
                    </>
                ),
            },
            {
                title: "Precio",
                key: "precio_cuota",
                sorter: {
                    compare: (a, b) => a.precio_cuota.toString().localeCompare(b.precio_cuota.toString())
                },
                render: (record) => (
                    <strong>
                        <span style={{ color: "#089D6C", fontSize: "1.2em" }}>
                            {formatoDinero(record.precio_cuota)}
                        </span>
                    </strong>
                ),
            },
            {
                title: "Última cuota cancelada",
                key: "ultimo_mes_pagado",
                sorter: (a, b) => moment(cFecha(a.ultimo_mes_pagado)).unix() - moment(cFecha(b.ultimo_mes_pagado)).unix(),
                render: (record) => (
                    <strong>{verFecha(record.ultimo_mes_pagado)}</strong>
                )
            },
            {
                title: "Estado",
                key: "estado",
                render: (record) => (
                    <strong>
                        <span style={{ color: "#089D6C", fontSize: "1em" }}>
                            {record.estado}
                        </span>
                    </strong>
                ),
            },
            {
                title: "Opciones",
                key: "opciones",
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Descargar">
                            <CloudDownloadOutlined
                                key="download"
                                onClick={() => this.download(record)}
                                style={{ color: "#389e0d" }}
                            />
                        </Tooltip>
                        <Tooltip title="Eliminar">
                            <DeleteOutlined
                                onClick={() => this.eliminar(record)}
                                style={{ color: "#f5222d" }}
                            />
                        </Tooltip>
                    </Space>
                ),
            },
        ];
    }

    //
    confirmEliminar = (contrato) => {
        let me = this;
        confirm({
            title: "¿Está seguro que desea eliminar este registro?",
            icon: <ExclamationCircleOutlined />,
            content: "Eliminar contrato",
            okText: "Sí",
            cancelText: "No",
            onOk() {
                me.eliminarContrato(contrato);
            },
        });
    };

    pagosMantenimientosContrato = async (contrato) => {
        return new Promise((resolve, reject) => {
            this.refPagos
                .where("codigo_contrato", "==", contrato.codigo)
                .limit(1)
                .get()
                .then((qs) => {
                    if (qs.size === 0) {
                        this.refMantenimientos
                            .where("codigo_contrato", "==", contrato.codigo)
                            .limit(1)
                            .get()
                            .then((qs) => {
                                resolve(qs.size);
                            });
                    } else {
                        resolve(qs.size);
                    }
                })
                .catch((err) => reject(err));
        });
    };

    // Se eliminan los contratos, pero no las cuotas
    eliminarContrato = (contrato) => {
        this.refContratos
            .doc(contrato.key)
            .delete()
            .then(() => message.success("Se eliminó el registro"))
            .catch((err) => message.error("Ocurrió un error"));
    };

    eliminar = async (record) => {
        message.loading("Verificando...");
        this.pagosMantenimientosContrato(record).then((size) => {
            message.destroy();
            if (size === 0) this.confirmEliminar(record);
            else if (size >= 1)
                message.error(
                    "No se puede eliminar este contrato porque ya se registraron pagos o mantenimientos"
                );
        });
    };
    //

    render() {
        const {
            contratos,
            loading,
            registro,
            redes,
            codigoCliente,
            modalDetalle,
            modalDetalleCliente,
        } = this.state;

        return (
            <div>
                {modalDetalle && (
                    <ModalDetalle
                        visible={modalDetalle}
                        codigoContrato={registro.key}
                        handleCancel={this.handleCancel}
                    />
                )}
                {modalDetalleCliente && (
                    <ModalDetalleCliente
                        visible={modalDetalleCliente}
                        codigoCliente={codigoCliente}
                        handleCancel={this.handleCancel}
                    />
                )}
                <PageHeader
                    className="site-page-header"
                    title="Contratos"
                    subTitle="Contratos con pagos pendientes"
                    extra={[
                        <Search
                            key="1"
                            placeholder="Buscar"
                            onSearch={(value) => this.buscar(value)}
                            style={{ width: 200 }}
                        />,
                    ]}
                />
                {!this.columnas[0].filters.length && // eslint-disable-next-line
                    redes.map((red) => {
                        this.columnas[0].filters.push({
                            text: `Red ${red.numero}`,
                            value: `R${red.numero}`,
                        });
                    })}
                {!this.columnas[2].filters.length &&
                    contratos
                        .map((contrato) => contrato.velocidad)
                        .filter(
                            (value, index, self) =>
                                self.indexOf(value) === index
                        )
                        .sort((a, b) => a - b) // eslint-disable-next-line
                        .map((velocidad) => {
                            this.columnas[2].filters.push({
                                text: `${velocidad} Mb`,
                                value: velocidad,
                            });
                        })}
                <Tabla
                    columnas={this.columnas}
                    data={contratos}
                    loading={loading}
                />
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
    };
}

export default connect(mapStateToProps)(Contratos);
