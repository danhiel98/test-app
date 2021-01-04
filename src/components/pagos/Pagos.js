import React, { Component } from "react";
import { connect } from "react-redux";
import Tabla from "../Tabla";
import ModalDetalle from "./ModalDetalle";
import DetalleContrato from "../contratos/ModalDetalle";
import DetalleCliente from "../clientes/ModalDetalle";
import {
    Popover,
    DatePicker,
    message,
    Tooltip,
    Space,
    Input,
    Row,
    Col,
    PageHeader,
    Button,
    Modal
} from "antd";
import {
    ExceptionOutlined,
    StopOutlined,
    BarcodeOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import locale from "antd/es/date-picker/locale/es_ES";
import app from "../../firebaseConfig";
import firebase from "firebase";
import moment from 'moment';

const { Search } = Input;
const { confirm } = Modal;

let ref = app.firestore();

const zeroPad = (num, places) => String(num).padStart(places, "0");

let opcFecha = { year: "numeric", month: "numeric", day: "numeric" };

const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const verUsuario = (usr) => capitalize(usr.split('@')[0]);

const formatoDinero = (num) =>
    new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
    }).format(num);

// Se debe evitar editar la fecha si ya se generó factura del pago
const SelectFecha = (props) => {
    let { record, disabled } = props;
    let fecha = null;
    let mora = 0;

    let selecFechaPago = async (codigo) => {

        if (fecha && fechaMayor(fecha, record.fecha_cuota)) mora = 3;

        ref.collection("pagos")
            .doc(codigo)
            .get()
            .then(async (d_pago) => {
                if (d_pago.exists) {
                    let pago = d_pago.data();
                    d_pago.ref.update({
                        fecha_pago: fecha,
                        mora,
                    });

                    await ref.collection('contratos')
                    .doc(pago.codigo_contrato)
                    .update({
                        fecha_ultimo_mes_pagado: fecha
                    })
                    .catch(error => {
                        console.log(error);
                    })
                }
                message.success("¡Fecha establecida correctamente!")
            });
    };

    return (
        <Space>
            <DatePicker
                disabled={disabled}
                locale={locale}
                format="DD-MMMM-YYYY"
                size="small"
                onChange={(date) => {
                    fecha = date ? new Date(date.get()) : null;
                }}
            />
            <CheckCircleOutlined
                onClick={() => selecFechaPago(record.key)}
                style={{ color: "#389e0d" }}
            />
        </Space>
    );
};

const fechaMayor = (fecha, fechaComparacion) => {
    let f1 = fecha;
    let f2 = fechaComparacion.toDate();

    if (f1.getYear() > f2.getYear()) return true;
    // Verdadero si el año es mayor
    else if (f1.getYear() < f2.getYear()) return false; // Falso si el año es menor

    // En caso que el año sea el mismo:
    if (f1.getMonth() > f2.getMonth()) return true;
    // Verdadero si el mes es mayor
    else if (f1.getMonth() < f2.getMonth()) return false; // Falso su el mes es menor

    // En caso que también el mes sea el mismo:
    if (f1.getDate() > f2.getDate()) return true; // Verdadero si el día es mayor

    return false; // Falso si es el mismo día o si es menor
};

const verFecha = (fecha) => {
    return capitalize(fecha.toDate().toLocaleDateString("es-SV", {year: "numeric", month: "short", }));
};

const cFecha = (fecha) => {
    if (fecha) return fecha.toDate();
    else return new Date();
}

class Pagos extends Component {
    constructor(props) {
        super(props);

        this.refPagos = ref.collection("pagos");
        this.refRedes = app.firestore().collection("redes");
        this.refContratos = ref.collection("contratos");
        this.unsubscribe = null;

        this.state = {
            user: props.user.user,
            busqueda: "",
            loading: true,
            pagos: [],
            redes: [],
            barcode: "",
            codigoContrato: "",
            codigoCliente: "",
            registro: null,
            modalDetalle: false,
            detalleContrato: false,
            detalleCliente: false,
            selectFechaVisible: false,
        };
    }

    verDetalle = (record) => {
        this.setState({
            registro: record,
            modalDetalle: true
        });
    };

    hide = () => {
        this.setState({ selectFechaVisible: false });
    };

    handleVisibleChange = (selectFechaVisible) => {
        this.setState({ selectFechaVisible });
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

        this.setState({redes});
    };

    obtenerPagos = (querySnapshot) => {
        const pagos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true });

        querySnapshot.forEach((doc) => {
            let {
                cantidad,
                facturado,
                codigo_contrato,
                nombre_cliente,
                numero_cuota,
                fecha_creacion,
                ref_cliente,
                fecha_cuota,
                fecha_pago,
                mora,
                mora_exonerada,
                usuario
            } = doc.data();

            if (
                busqueda &&
                codigo_contrato.toLowerCase().indexOf(busqueda) === -1 &&
                nombre_cliente.toLowerCase().indexOf(busqueda) === -1 &&
                verFecha(fecha_cuota).toLowerCase().indexOf(busqueda) === -1 &&
                cantidad.toString().indexOf(busqueda) === -1 &&
                usuario.toLowerCase().indexOf(busqueda) === -1
            ) {
                return;
            }

            pagos.push({
                key: doc.id,
                cantidad,
                codigo_contrato,
                nombre_cliente,
                numero_cuota,
                fecha_creacion,
                fecha_cuota,
                fecha_pago,
                mora,
                mora_exonerada,
                facturado,
                ref_cliente,
                usuario
            });
        });

        this.setState({
            pagos,
            loading: false,
        });
    };

    componentDidMount() {
        this.refPagos
            .orderBy("fecha_creacion", "desc")
            .onSnapshot(this.obtenerPagos);

        this.refRedes.orderBy("numero").onSnapshot(this.obtenerRedes);
    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ busqueda: valor.toLowerCase() });
            this.refPagos
                .get()
                .then((querySnapshot) => this.obtenerPagos(querySnapshot));
        }
    }

    columnas = this.asignarColumnas();

    verDetalleContrato = (codigo) => {
        this.setState({
            codigoContrato: codigo,
            detalleContrato: true
        });
    };

    verDetalleCliente = (codigo) => {
        this.setState({
            codigoCliente: codigo,
            detalleCliente: true
        });
    };

    handleCancel = () => {
        this.setState({
            modalDetalle: false,
            detalleCliente: false,
            detalleContrato: false,
        });
    };

    asignarColumnas() {
        return [
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
                title: "Cliente",
                key: "nombre_cliente",
                sorter: (a, b) => a.nombre_cliente.localeCompare(b.nombre_cliente),
                render: (record) => (
                    <Button
                        type="link"
                        onClick={() =>
                            this.verDetalleCliente(record.ref_cliente.id)
                        }
                    >
                        <strong>{record.nombre_cliente}</strong>
                    </Button>
                ),
            },
            {
                title: "Cantidad",
                key: "cantidad",
                sorter: (a, b) => a.cantidad.toString().localeCompare(b.cantidad.toString()),
                render: (record) => (
                    <strong>{formatoDinero(record.cantidad)}</strong>
                ),
            },
            {
                title: "Cuota",
                key: "numero_cuota",
                sorter: (a, b) => a.numero_cuota.localeCompare(b.numero_cuota),
                render: (record) => (
                    <Space>
                        {`${record.numero_cuota} - ${verFecha(record.fecha_cuota)}`}
                    </Space>
                ),
            },
            {
                title: "Fecha de pago",
                key: "fecha_pago",
                sorter: (a, b) => moment(cFecha(a.fecha_pago)).unix() - moment(cFecha(b.fecha_pago)).unix(),
                render: (record) => (
                    <Row justify="center">
                        <Col>
                            {record.fecha_pago
                                ? ` ${cFecha(record.fecha_pago)
                                      .toLocaleDateString("es-SV", opcFecha)} `
                                : "-"
                            }
                            {
                                !record.facturado &&
                                <Popover
                                    content={<SelectFecha disabled={record.facturado} record={record} />}
                                    title="Seleccione"
                                    trigger="click"
                                >
                                    <CalendarOutlined
                                        disabled={record.facturado}
                                        style={{ color: "#1c86c6" }}
                                    />
                                </Popover>
                            }
                        </Col>
                    </Row>
                ),
            },
            {
                title: "Mora",
                key: "mora",
                render: (record) => {
                    let style = {
                        textDecoration: "none",
                    };

                    if (record.mora_exonerada)
                        style.textDecoration = "line-through";

                    return (
                        <Space size="small">
                            <strong style={style}>{formatoDinero(record.mora)}</strong>
                            {
                                (record.mora > 0 && !record.facturado) &&
                                <Tooltip title="Alternar exoneración">
                                    <ExceptionOutlined
                                        disabled={record.mora === 0}
                                        key="exonerate"
                                        onClick={() => this.exonerarMora(record)}
                                        style={{ color: '#2124ce' }}
                                    />
                                </Tooltip>
                            }
                        </Space>
                    )
                },
            },
            {
                title: "Facturado",
                key: "facturado",
                align: "center",
                render: (record) => (
                    <Space>
                        {record.facturado ? (
                            <strong style={{ color: "#52c41a" }}>Sí</strong>
                        ) : (
                            <strong style={{ color: "#165473" }}>No</strong>
                        )}
                    </Space>
                ),
            },
            {
                title: "Usuario",
                key: "usuario",
                align: "center",
                render: (record) => (
                    <strong>{verUsuario(record.usuario)}</strong>
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

    agregarPago = async (codigo) => {
        let code = codigo.replace(/ /g, '');

        if (/(\d{20})/.test(code)) {
            let exist = false;
            let anteriorCancelado = false;
            let _red = Number.parseInt(code.substr(0, 4));
            let _ip = code.substr(5, 3);
            let codContrato = `R${_red}-${_ip}-${code.substr(8, 4)}-${code.substr(12, 4)}`;

            await this.refPagos
                .doc(code)
                .get()
                .then((pago) => {
                    if (pago.exists) {
                        message.error("¡Esta cuota ya fue cancelada!");
                        exist = true;
                    }
                })
                .catch(error => {
                    console.log(error);
                })

            if (exist) return;

            this.refContratos
                .doc(codContrato)
                .get()
                .then(async (d_contrato) => {
                    if (d_contrato.exists) {
                        let contrato = d_contrato.data();
                        let numCuota = Number.parseInt(code.substr(17, 4));

                        if (numCuota > 1) { // Para validar si la anterior ya fue pagada
                            await d_contrato.ref
                                .collection("cuotas")
                                .doc(`${zeroPad(numCuota - 1, 2)}`)
                                .get()
                                .then((doc) => {
                                    let cuota = doc.data();
                                    if (cuota.cancelado) anteriorCancelado = true;
                                });

                            // Si la cuota anterior a esta no ha sido cancelada, entonces no se puede agregar el pago
                            if (!anteriorCancelado) {
                                message.error("La cuota anterior no ha sido cancelada aún");
                                return;
                            }

                            if (numCuota === contrato.cant_cuotas) { // Cambiar estado de contrato a finalizado si cancela todas las cuotas
                                await d_contrato.ref.update({ estado: 'finalizado' });
                            }
                        }

                        d_contrato.ref
                            .collection('cuotas')
                            .doc(`${zeroPad(numCuota, 2)}`)
                            .get()
                            .then((d_cuota) => {
                                if (d_cuota.exists) {
                                    let cuota = d_cuota.data();

                                    this.refPagos
                                        .doc(cuota.codigo)
                                        .set({
                                            cantidad: cuota.cantidad,
                                            codigo_contrato: d_contrato.id,
                                            ref_cliente: contrato.ref_cliente,
                                            nombre_cliente: contrato.cliente,
                                            numero_cuota: d_cuota.id,
                                            fecha_cuota: cuota.fecha_pago,
                                            fecha_pago: null,
                                            mora: 0,
                                            mora_exonerada: false,
                                            facturado: false,
                                            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
                                            usuario: this.state.user.email
                                        })
                                        .then((doc) => {
                                            d_cuota.ref
                                                .update({ cancelado: true })
                                                .then(() => {
                                                    this.setState({ barcode: "" });
                                                    message.success("Pago registrado");
                                                });

                                            d_contrato.ref
                                            .update({
                                                ultima_cuota_pagada: d_cuota.id,
                                                ultimo_mes_pagado: cuota.fecha_pago,
                                                fecha_ultimo_mes_pagado: null
                                            });
                                        })
                                        .catch((error) => {
                                            message.error("Ocurrió un error, contacte con el administrador");
                                            console.log(error);
                                        });
                                }
                            });
                    } else {
                        message.error("La cuota NO existe");
                    }
                });
        } else {
            message.warn("El formato del código no es válido");
        }
    };

    exonerarMora = async (record) => {
        await this.refPagos
            .doc(record.key)
            .update({
                mora_exonerada: !record.mora_exonerada
            })
            .then(() => {
                if (record.mora_exonerada)
                    message.success('¡Se quitó la exoneración de la mora!')
                else
                    message.success('¡Se exoneró la mora correctamente!')
            })
            .catch(error => {
                console.log(error);
                message.error('Ocurrió un error');
            })
    }

    eliminar = async (record) => {
        let siguienteCancelada = false;

        if (record.facturado) {
            message.error('¡Este pago ya fue facturado!')
            return;
        }

        await this.refContratos
            .doc(record.codigo_contrato)
            .get()
            .then(async (d_contrato) => {
                if (d_contrato.exists) {
                    let numCuota = Number.parseInt(record.numero_cuota);

                    await d_contrato.ref
                        .collection("cuotas")
                        .doc(zeroPad(numCuota + 1, 2))
                        .get()
                        .then((d_cuota) => {
                            if (d_cuota.exists && d_cuota.data().cancelado) siguienteCancelada = true;
                        });
                }
            });

        // Si hay un pago más reciente, se debe eliminar ese primero
        if (siguienteCancelada) {
            message.error("Primero debe eliminar los pagos más recientes");
            return;
        }

        let me = this;

        confirm({
            title: "¿Está seguro que desea eliminar este pago?",
            icon: <ExclamationCircleOutlined />,
            content: "Eliminar pago",
            okText: "Sí",
            cancelText: "No",
            onOk() {
                me.eliminarPago(record);
            },
        });
    };

    eliminarPago = async (record) => {
        let numeroCuota = Number.parseInt(record.numero_cuota);
        let ultimaCuotaPagada = null;
        let ultimoMesPagado = null;
        let fechaUltimoMesPagado = null;

        await this.refPagos
            .doc(`${record.key}`)
            .delete()
            .then(() => {
                this.refContratos
                    .doc(record.codigo_contrato)
                    .get()
                    .then(async (d_contrato) => {
                        if (d_contrato.exists) {

                            d_contrato.ref
                            .collection("cuotas")
                            .doc(record.numero_cuota)
                            .get()
                            .then((cuota) => {
                                if (cuota.exists) {
                                    cuota.ref
                                        .update({ cancelado: false })
                                        .then(() => {
                                            message.success("Pago eliminado");
                                        });
                                }
                            });

                            if (numeroCuota > 1) {
                                await this.refPagos
                                    .doc(`${record.key.substr(0, 16)}${zeroPad(numeroCuota - 1, 4)}`)
                                    .get()
                                    .then(d_pago => {
                                        let pago = d_pago.data();
                                        ultimoMesPagado = pago.fecha_cuota;
                                        fechaUltimoMesPagado = pago.fecha_pago;
                                        ultimaCuotaPagada = pago.numero_cuota;
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    })
                            }

                            d_contrato.ref
                            .update({
                                ultima_cuota_pagada: ultimaCuotaPagada,
                                ultimo_mes_pagado: ultimoMesPagado,
                                fecha_ultimo_mes_pagado: fechaUltimoMesPagado,
                            })
                        } else {
                            message.error("La cuota NO existe");
                        }
                    });
            });
    }

    render() {
        const {
            pagos,
            redes,
            loading,
            registro,
            modalDetalle,
            detalleContrato,
            detalleCliente,
            codigoContrato,
            codigoCliente,
        } = this.state;

        return (
            <div>
                {modalDetalle && (
                    <ModalDetalle
                        visible={modalDetalle}
                        codigoPago={registro.key}
                        handleCancel={this.handleCancel}
                    />
                )}

                <PageHeader
                    className="site-page-header"
                    title="Pagos"
                    subTitle="Agregar pago"
                    onBack={() => null}
                    extra={[
                        <Input
                            key="1"
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 280 }}
                            autoFocus
                            maxLength={24}
                            allowClear
                            value={this.state.barcode}
                            onChange={(ev) =>
                                this.setState({ barcode: ev.target.value })
                            }
                            onKeyUp={(ev) => {
                                if (ev.keyCode === 13) {
                                    this.agregarPago(ev.target.value);
                                }
                            }}
                        />,
                    ]}
                />
                {detalleContrato && (
                    <DetalleContrato
                        visible={detalleContrato}
                        codigoContrato={codigoContrato}
                        handleCancel={this.handleCancel}
                    />
                )}
                {detalleCliente && (
                    <DetalleCliente
                        visible={detalleCliente}
                        codigoCliente={codigoCliente}
                        handleCancel={this.handleCancel}
                    />
                )}

                {
                    !this.columnas[0].filters.length && // eslint-disable-next-line
                    redes.map((red) => {
                        this.columnas[0].filters.push({
                            text: `Red ${red.numero}`,
                            value: `R${red.numero}`,
                        });
                    })
                }

                <Tabla
                    titulo={
                        <>
                            <Row justify="space-between">
                                <Col span={4}>
                                    <strong>Lista de pagos</strong>
                                </Col>
                                <Col span={4} offset={5}>
                                    <Space>
                                        <Search
                                            placeholder="Buscar"
                                            onSearch={(value) =>
                                                this.buscar(value)
                                            }
                                            style={{ width: 180 }}
                                        />
                                    </Space>
                                </Col>
                            </Row>
                        </>
                    }
                    columnas={this.columnas}
                    data={pagos}
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

export default connect(mapStateToProps)(Pagos);
