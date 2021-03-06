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
    EditOutlined,
    StopOutlined,
    DeleteOutlined,
    CloudDownloadOutlined,
} from "@ant-design/icons";
import app from "../../firebaseConfig";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import Tabla from "../Tabla";
import ModalDatos from "./ModalDatos";
import ModalDetalle from "./ModalDetalle";
import ModalDesactivar from "./ModalDesactivar";
import ModalDetalleCliente from "../clientes/ModalDetalle";
import Contrato from "../reportes/Contrato";
import { pdf } from "@react-pdf/renderer";
import moment from 'moment';

const { confirm } = Modal;
const { Search } = Input;

const opcFecha = { year: "numeric", month: "short" };

const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const verFecha = (fecha) => {
    return capitalize(fecha.toDate().toLocaleDateString("es-SV", opcFecha));
};

const cFecha = (fecha) => {
    if (fecha) return fecha.toDate();
    else return new Date();
}

const colorEstado = (estado) => {
    let ret = { color: '#000' };
    switch (estado) {
        case 'activo':
            ret.color = '#15d733';
            break;
        case 'inactivo':
            ret.color = '#f67a2c';
            break;
        case 'finalizado':
            ret.color = '#3388f5';
            break;
        default:
            break;
    }

    return ret;
}

class Contratos extends Component {
    constructor(props) {
        super(props);

        this.refContratos = app.firestore().collection("contratos");
        this.refClientes = app.firestore().collection("clientes");
        this.refRedes = app.firestore().collection("redes");
        this.refIPs = app.firestore().collection('ips');
        this.refPagos = app.firestore().collection("pagos");
        this.refMantenimientos = app.firestore().collection("mantenimientos");

        this.unsubscribe = null;
        this.state = {
            user: props.user.user,
            loading: true,
            contratos: [],
            clientes: [],
            redes: [],
            visible: false,
            registro: null,
            modalDesactivar: false,
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
                usuario
            } = doc.data();

            if (
                busqueda &&
                cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo.toLowerCase().indexOf(busqueda) === -1 &&
                verFecha(fecha_inicio).toLowerCase().indexOf(busqueda) === -1 &&
                verFecha(fecha_fin).toLowerCase().indexOf(busqueda) === -1 &&
                usuario.toLowerCase().indexOf(busqueda) === -1
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
                usuario
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
            .orderBy("fecha_ingreso", "desc")
            .onSnapshot(this.obtenerContratos);
        this.refClientes
            .orderBy("fecha_creacion", "desc")
            .onSnapshot(this.obtenerClientes);
        this.refRedes.orderBy("numero").onSnapshot(this.obtenerRedes);
    }

    componentDidUpdate(prevState, newState) {}

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true });
            this.setState({ busqueda: valor.toLowerCase() });
            this.refContratos
                .get()
                .then((querySnapshot) => this.obtenerContratos(querySnapshot));
        }
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record,
        });
    };

    modalDesactivarContrato = (record) => {
        this.setState({
            modalDesactivar: true,
            registro: record,
        });
    }

    handleCancel = () => {
        this.setState({
            modalDetalle: false,
            modalDetalleCliente: false,
            modalDesactivar: false,
            visible: false,
            registro: null,
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
            message.error('??Ocurri?? un error al obtener la informaci??n del cliente!')
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
                title: "C??digo",
                key: "codigo",
                sorter: {
                    compare: (a, b) => a.red.toString().localeCompare(b.red.toString()),
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
                sorter: (a, b) => a.cliente.localeCompare(b.cliente),
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
                sorter: (a, b) => a.velocidad.toString().localeCompare(b.velocidad.toString()),
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
                sorter: (a, b) => a.precio_cuota.toString().localeCompare(b.precio_cuota.toString()),
                render: (record) => (
                    <strong>
                        <span style={{ color: "#089D6C", fontSize: "1.2em" }}>
                            {this.formatoDinero(record.precio_cuota)}
                        </span>
                    </strong>
                ),
            },
            {
                title: "Fecha inicio",
                key: "fecha_inicio",
                sorter: (a, b) => moment(cFecha(a.fecha_inicio)).unix() - moment(cFecha(b.fecha_inicio)).unix(),
                render: (record) => (
                    <span>
                        {verFecha(record.fecha_inicio)}
                    </span>
                )
            },
            {
                title: "Fecha fin",
                key: "fecha_fin",
                sorter: (a, b) => moment(cFecha(a.fecha_fin)).unix() - moment(cFecha(b.fecha_fin)).unix(),
                render: (record) => (
                    <span>
                        {verFecha(record.fecha_fin)}
                    </span>
                )
            },
            {
                title: "Estado",
                key: "estado",
                filters: [
                    {
                        text: 'Activo',
                        value: 'activo',
                    },
                    {
                        text: 'Finalizado',
                        value: 'finalizado',
                    },
                    {
                        text: 'Inactivo',
                        value: 'inactivo',
                    }
                ],
                onFilter: (value, record) => record.estado.indexOf(value) === 0,
                sorter: (a, b) => a.estado.toString().localeCompare(b.estado.toString()),
                render: (record) => (
                    <strong>
                        <span style={colorEstado(record.estado)}>
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
                        <Tooltip title="Editar">
                            <EditOutlined
                                onClick={() => this.modalData(record)}
                                style={{ color: "#fa8c16" }}
                            />
                        </Tooltip>
                        <Tooltip title="Dar de baja">
                            <StopOutlined
                                onClick={() => this.desactivar(record)}
                                style={{ color: "#203acc" }}
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

    confirmEliminar = (contrato) => {
        let me = this;
        confirm({
            title: "??Est?? seguro que desea eliminar este registro?",
            icon: <ExclamationCircleOutlined />,
            content: "Eliminar contrato",
            okText: "S??",
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
            .then(() => {

                this.refIPs
                .doc(`${contrato.red}-${contrato.ip}`)
                .get()
                .then(d_ip => {
                    d_ip.ref.update({ libre: true })
                })
                message.success("Se elimin?? el registro")
            })
            .catch((err) => message.error("Ocurri?? un error"));
    };

    desactivar = async (record) => {
        if (record.estado !== 'activo') {
            message.error('??Este contrato no se puede desactivar porque no est?? activo!');
            return;
        }

        let me = this;
        confirm({
            title: "??Est?? seguro que desea dar de baja a este contrato?",
            icon: <ExclamationCircleOutlined />,
            content: "Desactivar contrato",
            okText: "S??",
            cancelText: "No",
            onOk() {
                me.modalDesactivarContrato(record);
            },
        });
    };

    eliminar = async (record) => {
        message.loading("Verificando...");
        this.pagosMantenimientosContrato(record).then((size) => {
            message.destroy();
            if (size === 0) this.confirmEliminar(record);
            else if (size >= 1) message.error("No se puede eliminar este contrato porque ya se registraron pagos o mantenimientos");
        });
    };

    render() {
        const {
            contratos,
            loading,
            visible,
            registro,
            clientes,
            redes,
            codigoCliente,
            modalDetalle,
            modalDetalleCliente,
            modalDesactivar,
            user
        } = this.state;

        return (
            <div>
                {visible && (
                    <ModalDatos
                        visible={visible}
                        title={ registro ? "Editar informaci??n" : "Nuevo contrato" }
                        user={user}
                        clientes={clientes}
                        redes={redes}
                        handleCancel={this.handleCancel}
                        record={registro}
                        fireRef={this.refContratos}
                    />
                )}
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
                {modalDesactivar && (
                    <ModalDesactivar
                        visible={modalDesactivar}
                        codigoContrato={registro.key}
                        handleCancel={this.handleCancel}
                    />
                )}
                <PageHeader
                    className="site-page-header"
                    title="Contratos"
                    subTitle="Lista de contratos"
                    extra={[
                        <Search
                            key="1"
                            placeholder="Buscar"
                            onSearch={(value) => this.buscar(value)}
                            style={{ width: 200 }}
                        />,
                        <Button
                            key="2"
                            type="primary"
                            ghost
                            onClick={() => this.modalData()}
                        >
                            Nuevo
                        </Button>,
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
