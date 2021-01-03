import React, { Component } from "react";
import {
    message,
    Modal,
    Row,
    Col,
    Popover,
    Tooltip,
    Space,
    PageHeader,
    Input,
    Button,
    InputNumber,
} from "antd";
import {
    InfoCircleOutlined,
    EditOutlined,
    StopOutlined,
    CloudDownloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from "@ant-design/icons";
import app from "../../firebaseConfig";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Tabla from "../Tabla";
import Factura from "../reportes/Factura";
import { pdf } from "@react-pdf/renderer";
import DetalleCliente from "../clientes/ModalDetalle";
import ModalDatos from "./ModalDatos";
import ModalDetalle from "./ModalDetalle";
import DetalleContrato from "../contratos/ModalDetalle";
import moment from 'moment';

const { Search } = Input;
const { confirm } = Modal;

let ref = app.firestore();

const zeroPad = (num, places) => String(num).padStart(places, "0");

const cFecha = (fecha) => {
    if (fecha) return fecha.toDate();
    else return new Date();
}

const SelectNumero = (props) => {
    let { record } = props;
    let numero = 0;

    let cambiarNumero = () => {
        if (numero <= 0) {
            message.error("Debe introducir un número mayor a cero");
            return;
        }

        ref.collection("facturas")
            .doc(record.key)
            .update({
                numero: zeroPad(numero, 6),
            })
            .then(() => {
                message.success("¡Número establecido correctamente!");
            });
    };

    return (
        <Space>
            <InputNumber
                size="small"
                min={1}
                max={100000}
                onChange={(val) => {
                    numero = val;
                }}
                onPressEnter={(ev) => cambiarNumero()}
            />
            <CheckCircleOutlined
                onClick={() => cambiarNumero()}
                style={{ color: "#389e0d" }}
            />
        </Space>
    );
};

class Facturas extends Component {
    constructor(props) {
        super(props);

        this.mainRef = app.firestore();
        this.refFacturas = this.mainRef.collection("facturas");
        this.refClientes = this.mainRef.collection("clientes");
        this.refRedes = this.mainRef.collection("redes");
        this.refPagos = this.mainRef.collection("pagos");
        this.opcFecha = { year: "numeric", month: "numeric", day: "numeric" };

        this.unsubscribe = null;
        this.state = {
            user: props.user.user,
            loading: true,
            facturas: [],
            redes: [],
            clientes: [],
            visible: false,
            registro: null,
            modalDetalle: false,
            modalDetalleCliente: false,
            modalDetalleContrato: false,
            codigoContrato: null,
            codigoCliente: null,
        };
    }

    formatoDinero = (num) =>
        new Intl.NumberFormat("es-SV", {
            style: "currency",
            currency: "USD",
        }).format(num);


    obtenerFacturas = (qs) => {
        const facturas = [];
        const { busqueda } = this.state;

        qs.forEach(async (doc) => {
            let {
                cantidad_pagos,
                codigo_contrato,
                numero,
                fecha,
                nombre_cliente,
                sumas,
                mora,
                mora_exonerada,
                total,
                total_letras,
                ref_cliente,
                cuotas,
                usuario
            } = doc.data();

            if (
                busqueda &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                total_letras.toLowerCase().indexOf(busqueda) === -1 &&
                usuario.toLowerCase().indexOf(busqueda) === -1
            )
                return;

            facturas.push({
                key: doc.id,
                codigo_contrato,
                nombre_cliente,
                fecha,
                cantidad_pagos,
                total,
                total_letras,
                ref_cliente,
                cuotas,
                sumas,
                mora,
                mora_exonerada,
                numero,
                usuario
            });
        });
        this.setState({
            facturas,
            loading: false,
        });
    };

    obtenerRedes = (qs) => {
        const redes = [];

        qs.forEach((doc) => {
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

    obtenerClientes = (qs) => {
        const clientes = [];

        qs.forEach((doc) => {
            let { dui, nombre, apellido } = doc.data();

            clientes.push({
                key: doc.id,
                ref: doc.ref,
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
        this.unsubscribe = this.refFacturas
            .orderBy("fecha_creacion", "desc")
            .onSnapshot(this.obtenerFacturas);

        this.refClientes
            .orderBy("fecha_creacion", "desc")
            .onSnapshot(this.obtenerClientes);

        this.refRedes.orderBy("numero").onSnapshot(this.obtenerRedes);
    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true });
            this.setState({ busqueda: valor.toLowerCase() });
            this.refFacturas.get().then((qs) => this.obtenerFacturas(qs));
        }
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record,
        });
    };

    handleCancel = () => {
        this.setState({
            registro: null,
            modalDetalle: false,
            modalDetalleCliente: false,
            modalDetalleContrato: false,
            codigoContrato: null,
            visible: false,
        });
    };

    capitalize = (s) => {
        if (typeof s !== "string") return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    irA = (ruta) => {
        this.unsubscribe();
        this.props.dispatch(push(`facturas/${ruta}`));
    };

    verDetalle = (record) => {
        this.setState({
            registro: record,
            modalDetalle: true
        });
    };

    verDetalleContrato = (codigo) => {
        this.setState({
            codigoContrato: codigo,
            modalDetalleContrato: true
        });
    };

    verDetalleCliente = (record) => {
        this.setState({
            codigoCliente: record.ref_cliente.id,
            modalDetalleCliente: true
        });
    };

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: "Cliente",
                key: "cliente",
                sorter: (a, b) => a.nombre_cliente.localeCompare(b.nombre_cliente),
                render: (record) => (
                    <Button
                        type="link"
                        onClick={() => this.verDetalleCliente(record)}
                    >
                        <strong>{record.nombre_cliente}</strong>
                    </Button>
                ),
            },
            {
                title: "Contrato",
                key: "codigo_contrato",
                sorter: (a, b) => a.codigo_contrato.substr(1).localeCompare(b.codigo_contrato.substr(1)),
                filters: [],
                onFilter: (value, record) => record.codigo_contrato.indexOf(value) === 0,
                render: (record) => (
                    <Button
                        type="link"
                        onClick={() =>
                            this.verDetalleContrato(record.codigo_contrato)
                        }
                    >
                        <strong>{record.codigo_contrato}</strong>
                    </Button>
                ),
            },
            {
                title: "No. Factura",
                key: "numero",
                render: (record) => (
                    <Row justify="center">
                        <Col>
                            {record.numero ? record.numero : "-"}
                            <Popover
                                content={<SelectNumero record={record} />}
                                title="Seleccione"
                                trigger="click"
                            >
                                <EditOutlined style={{ color: "#1c86c6" }} />
                            </Popover>
                        </Col>
                    </Row>
                ),
            },
            {
                title: "Fecha",
                dataIndex: "fecha",
                sorter: (a, b) => moment(cFecha(a.fecha)).unix() - moment(cFecha(b.fecha)).unix(),
                render: (fecha) => (
                    <strong>
                        {cFecha(fecha)
                            .toLocaleDateString("es-SV", this.opcFecha)}
                    </strong>
                ),
            },
            {
                title: "Cant. cuotas",
                key: "cantidad_pagos",
                sorter: (a, b) => a.cantidad_pagos.toString().localeCompare(b.cantidad_pagos.toString()),
                align: "center",
                render: (record) => <strong>{record.cantidad_pagos}</strong>,
            },
            {
                title: "Sumas",
                key: "sumas",
                sorter: (a, b) => a.sumas.toString().localeCompare(b.sumas.toString()),
                render: (record) => <strong>{this.formatoDinero(record.sumas)}</strong>,
            },
            {
                title: "Mora",
                key: "mora",
                render: (record) => {
                    let mora = record.mora_exonerada ? 0 : record.mora;

                    return <strong>{this.formatoDinero(mora)}</strong>;
                },
            },
            {
                title: "Total",
                key: "total",
                sorter: (a, b) => a.total.toString().localeCompare(b.total.toString()),
                render: (record) => (
                    <strong>
                        <span style={{ color: "#089D6C", fontSize: "1.2em" }}>
                            {this.formatoDinero(record.total)}
                        </span>
                    </strong>
                ),
            },

            {
                title: "Opciones",
                key: "opciones",
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Detalles">
                            <InfoCircleOutlined
                                key="info"
                                onClick={() => this.verDetalle(record)}
                                style={{ color: "#0d9e8a" }}
                            />
                        </Tooltip>
                        <Tooltip title="Descargar">
                            <CloudDownloadOutlined
                                key="download"
                                onClick={() => this.download(record)}
                                style={{ color: "#389e0d" }}
                            />
                        </Tooltip>
                        <Tooltip title="Cancelar">
                            <StopOutlined
                                key="cancel"
                                onClick={() => this.eliminar(record)}
                                style={{ color: "#f5222d" }}
                            />
                        </Tooltip>
                    </Space>
                ),
            },
        ];
    }

    download = (record) => {
        pdf(Factura({ factura: record }))
            .toBlob()
            .then((file) => {
                var csvURL = window.URL.createObjectURL(file);
                let tempLink = document.createElement("a");
                tempLink.href = csvURL;
                tempLink.setAttribute(
                    "download",
                    `Factura (${record.nombre_cliente}).pdf`
                );
                tempLink.click();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    eliminar = async (record) => {
        let ultimaCuota = record.cuotas[record.cuotas.length - 1];
        let numUltimaCuota = Number.parseInt(ultimaCuota.num_cuota);
        let siguienteFacturado = false;
        let _codContrato = record.codigo_contrato.split('-');
        let _red = Number.parseInt(_codContrato[0].substr(1));
        let codigoContrato = `${zeroPad(_red, 4)}0${_codContrato[1]}${record.codigo_contrato.substr(8, 4)}${record.codigo_contrato.substr(13, 4)}`;

        await this.refPagos
            .doc(`${codigoContrato}-${zeroPad(numUltimaCuota + 1, 4)}`)
            .get()
            .then((doc) => {
                if (doc.exists && doc.data().facturado) siguienteFacturado = true;
            })
            .catch((error) => {
                message.error("Ocurrió un error al eliminar la factura");
                console.log(error);
            });

        if (siguienteFacturado) {
            message.error(
                "¡Hay facturas más recientes, debe eliminar esas primero!"
            );
            return;
        }

        let me = this;

        confirm({
            title: "¿Está seguro que desea eliminar este registro?",
            icon: <ExclamationCircleOutlined />,
            content: "Eliminar información de factura",
            okText: "Sí",
            cancelText: "No",
            onOk() {
                me.eliminarFactura(record);
            },
        });
    };

    eliminarFactura = async (record) => {
        let _codContrato = record.codigo_contrato.split('-');
        let _red = Number.parseInt(_codContrato[0].substr(1));
        let _ip = Number.parseInt(_codContrato[1]);
        let codigoContrato = `${zeroPad(_red, 4)}${zeroPad(_ip, 4)}${record.codigo_contrato.substr(8, 4)}${record.codigo_contrato.substr(13, 4)}`;

        this.refFacturas
            .doc(record.key)
            .delete()
            .then(async () => {

                await record.cuotas.forEach(async cuota => {
                    await this.refPagos
                    .doc(`${codigoContrato}${zeroPad(Number.parseInt(cuota.num_cuota), 4)}`)
                    .get()
                    .then((doc) => {
                        if (doc.exists) {
                            doc.ref.update({ facturado: false }) // Cambiar estado a pago
                        }
                    })
                    .catch((error) => {
                        message.error("Ocurrió un error al eliminar la factura");
                        console.log(error);
                    });
                })
                message.success("¡Se eliminó la factura correctamente!");
            })
            .catch((error) => {
                message.error("¡Ocurrió un error al eliminar la factura!");
            });
    };

    render() {
        const {
            facturas,
            redes,
            loading,
            visible,
            registro,
            clientes,
            codigoCliente,
            modalDetalle,
            modalDetalleCliente,
            modalDetalleContrato,
            codigoContrato,
            user
        } = this.state;

        return (
            <div>
                {visible && (
                    <ModalDatos
                        visible={visible}
                        title={
                            registro ? "Editar información" : "Nueva factura"
                        }
                        user={user}
                        clientes={clientes}
                        handleCancel={this.handleCancel}
                        record={registro}
                        fireRef={this.refContratos}
                    />
                )}
                {modalDetalle && (
                    <ModalDetalle
                        visible={modalDetalle}
                        codigoFactura={registro.key}
                        handleCancel={this.handleCancel}
                    />
                )}
                {modalDetalleCliente && (
                    <DetalleCliente
                        visible={modalDetalleCliente}
                        codigoCliente={codigoCliente}
                        handleCancel={this.handleCancel}
                    />
                )}
                {modalDetalleContrato && (
                    <DetalleContrato
                        visible={modalDetalleContrato}
                        codigoContrato={codigoContrato}
                        handleCancel={this.handleCancel}
                    />
                )}
                <PageHeader
                    className="site-page-header"
                    title="Facturas"
                    subTitle="Lista de facturas"
                    extra={[
                        <Search
                            key="buscar"
                            placeholder="Buscar"
                            onSearch={(value) => this.buscar(value)}
                            style={{ width: 200 }}
                        />,
                        <Button
                            key="nuevo"
                            type="primary"
                            ghost
                            onClick={() => this.modalData()}
                        >
                            Nuevo
                        </Button>,
                    ]}
                />
                {
                    !this.columnas[1].filters.length && // eslint-disable-next-line
                    redes.map(red => {
                        this.columnas[1].filters.push(
                            {
                                text: `Red ${red.numero}`,
                                value: `R${red.numero}`,
                            },
                        );
                    })
                }
                <Tabla
                    columnas={this.columnas}
                    data={facturas}
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

export default connect(mapStateToProps)(Facturas);
