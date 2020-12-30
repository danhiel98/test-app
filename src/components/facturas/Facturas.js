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

const { Search } = Input;
const { confirm } = Modal;

let ref = app.firestore();

const zeroPad = (num, places) => String(num).padStart(places, "0");

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
        this.refPagos = this.mainRef.collection("pagos");
        this.opcFecha = { year: "numeric", month: "numeric", day: "numeric" };

        this.unsubscribe = null;
        this.state = {
            loading: true,
            facturas: [],
            clientes: [],
            visible: false,
            registro: null,
            modalDetalle: false,
            modalDetalleCliente: false,
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
            } = doc.data();

            if (
                busqueda &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                total_letras.toLowerCase().indexOf(busqueda) === -1
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
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    };

    verDetalleCliente = (record) => {
        this.setState({ codigoCliente: record.ref_cliente.id });
        this.setState({ modalDetalleCliente: true });
    };

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: "Cliente",
                key: "cliente",
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
                render: (fecha) => (
                    <strong>
                        {fecha
                            .toDate()
                            .toLocaleDateString("es-SV", this.opcFecha)}
                    </strong>
                ),
            },
            {
                title: "Cant. cuotas",
                dataIndex: "cantidad_pagos",
                sorter: true,
                align: "center",
                render: (cantidad_pagos) => <strong>{cantidad_pagos}</strong>,
            },
            {
                title: "Sumas",
                dataIndex: "sumas",
                render: (sumas) => <strong>{this.formatoDinero(sumas)}</strong>,
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
                dataIndex: "total",
                sorter: true,
                render: (total) => (
                    <strong>
                        <span style={{ color: "#089D6C", fontSize: "1.2em" }}>
                            {this.formatoDinero(total)}
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

        await this.refPagos
            .doc(`${record.codigo_contrato}-${zeroPad(numUltimaCuota + 1, 2)}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    if (doc.data().facturado) siguienteFacturado = true;
                }
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
        let codContrato = `${zeroPad(_red, 4)}-${zeroPad(_ip, 4)}-${_codContrato[2]}-${_codContrato[3]}`;

        this.refFacturas
            .doc(record.key)
            .delete()
            .then(async () => {

                await record.cuotas.forEach(async cuota => {
                    await this.refPagos
                    .doc(`${codContrato}-${zeroPad(Number.parseInt(cuota.num_cuota), 4)}`)
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
            loading,
            visible,
            registro,
            clientes,
            codigoCliente,
            modalDetalle,
            modalDetalleCliente,
        } = this.state;

        return (
            <div>
                {visible && (
                    <ModalDatos
                        visible={visible}
                        title={
                            registro ? "Editar información" : "Nueva factura"
                        }
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
                {/* {
                    !this.columnas[0].filters.length && // eslint-disable-next-line
                    redes.map(red => {
                        this.columnas[0].filters.push(
                            {
                                text: `Red ${red.numero}`,
                                value: `R${red.numero}`,
                            },
                        );
                    })
                }
                {
                    !this.columnas[2].filters.length &&
                    facturas.map(contrato => contrato.velocidad)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort((a, b) => a - b) // eslint-disable-next-line
                    .map(velocidad => {
                        this.columnas[2].filters.push({
                            text: `${velocidad} Mb`,
                            value: velocidad
                        });
                    })
                } */}
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
