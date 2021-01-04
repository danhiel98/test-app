import React, { useState, useEffect } from "react";
import {
    Space,
    Table,
    message,
    Row,
    Col,
    DatePicker,
    Select,
    Form,
    Input,
    Modal,
    Button,
    Tooltip,
    Divider,
    Popover,
} from "antd";
import {
    ExceptionOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    StopOutlined,
    BarcodeOutlined,
} from "@ant-design/icons";
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";
import app from "../../firebaseConfig";
import firebase from "firebase";

const NumerosALetras = require("../../NumerosALetras");

const { Option } = Select;

const opcFecha = { year: "numeric", month: "long" };
const opcFecha2 = { year: "numeric", month: "long", day: "numeric" };

const formatoDinero = (num) =>
    new Intl.NumberFormat("es-SV", {
        style: "currency",
        currency: "USD",
    }).format(num);

const verFecha = (fecha, todo = false) => {
    let opc = todo ? opcFecha2 : opcFecha;
    return fecha.toDate().toLocaleString("es-SV", opc);
};

const fechaMayor = (fecha, fechaComparacion) => {
    let f1 = (fecha instanceof Date) ? fecha : fecha.toDate();
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

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { record, clientes, user } = props;

    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState(null);
    const [contratos, setContratos] = useState([]);
    const [total, setTotal] = useState(0);
    const [mora, setMora] = useState(0);
    const [sumas, setSumas] = useState(0);
    const [pagos, setPagos] = useState([]);
    const [cuotas, setCuotas] = useState([]); // Para guardar los números de las cuotas facturadas
    const [barcode, setBarcode] = useState("");
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [stValidacionContrato, setStValidacionContrato] = useState(null);
    const [msgValidacionContrato, setMsgValidacionContrato] = useState(null);

    let refFacturas = app.firestore().collection("facturas");
    let refContratos = app.firestore().collection("contratos");
    let refPagos = app.firestore().collection("pagos");

    useEffect(() => {

    }, []);

    const zeroPad = (num, places) => String(num).padStart(places, "0");

    const handleOk = async () => {
        setLoading(true);

        await form.validateFields()
            .then(async (val) => {
                if (pagos.length === 0) {
                    message.error("¡No hay ningún pago a facturar!");
                    return;
                }

                let factura = {
                    fecha: new Date(val.fecha),
                    cantidad_pagos: pagos.length,
                    cuotas: cuotas,
                    mora: mora,
                    sumas: Math.round(sumas * 100) / 100,
                    total: Math.round(total * 100) / 100,
                    total_letras: NumerosALetras.default(total),
                    eliminado: false,
                    codigo_contrato: contrato.codigo,
                    nombre_cliente: contrato.cliente,
                    ref_cliente: contrato.ref_cliente,
                    fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
                    usuario: user.email
                };

                // Agregar factura y actualizar estado de los pagos a 'facturado'
                await refFacturas.add(factura)
                .then(docRef => {
                    pagos.forEach(pago => {
                        pago.ref.update({ facturado: true });
                    })
                    message.success('¡Factura agregada correctamente!')
                    form.resetFields();
                    props.handleCancel()
                })
                .catch(error => {
                    message.error('Ha ocurrido un error');
                    console.log(error);
                })
            })
            .catch((error) => {
                message.warning("¡Verifique la información ingresada!");
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const agregarPago = async (codigo) => {
        let code = codigo.replace(/ /g, '');

        if (/\d{20}/.test(code)) {
            let exist = false;
            let anteriorCancelado = false;
            let _red = Number.parseInt(code.substr(0, 4));
            let _ip = code.substr(5, 3);
            let codContrato = `R${_red}-${_ip}-${code.substr(8, 4)}-${code.substr(12, 4)}`;

            await refPagos
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

            refContratos
                .doc(codContrato)
                .get()
                .then(async (d_contrato) => {
                    if (d_contrato.exists) {
                        let cont = d_contrato.data();
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

                            if (numCuota === cont.cant_cuotas) { // Cambiar estado de contrato a finalizado si cancela todas las cuotas
                                await d_contrato.ref
                                    .update({ estado: 'finalizado' });
                            }
                        }

                        d_contrato.ref
                            .collection('cuotas')
                            .doc(`${zeroPad(numCuota, 2)}`)
                            .get()
                            .then((d_cuota) => {
                                if (d_cuota.exists) {
                                    let cuota = d_cuota.data();
                                    let fechaPago = new Date();

                                    refPagos
                                        .doc(cuota.codigo)
                                        .set({
                                            cantidad: cuota.cantidad,
                                            codigo_contrato: cont.codigo,
                                            ref_cliente: cont.ref_cliente,
                                            nombre_cliente: cont.cliente,
                                            numero_cuota: d_cuota.id,
                                            fecha_cuota: cuota.fecha_pago,
                                            fecha_pago: fechaPago,
                                            mora: fechaMayor(fechaPago, cuota.fecha_pago) ? 3 : 0,
                                            mora_exonerada: false,
                                            facturado: false,
                                            fecha_creacion: firebase.firestore.FieldValue.serverTimestamp(),
                                            usuario: user.email
                                        })
                                        .then((doc) => {
                                            d_cuota.ref
                                                .update({ cancelado: true })
                                                .then(async () => {
                                                    setBarcode("");
                                                    form.setFieldsValue({ id_cliente: cont.ref_cliente.id });
                                                    await cargarContratos(cont.ref_cliente.id);
                                                    form.setFieldsValue({ id_contrato: cont.codigo });
                                                    d_contrato.ref
                                                    .update({
                                                        ultima_cuota_pagada: cuota.numero_cuota,
                                                        ultimo_mes_pagado: cuota.fecha_pago,
                                                        fecha_ultimo_mes_pagado: fechaPago
                                                    })
                                                    cargarPagos(cont.codigo);
                                                    message.success("Pago registrado");
                                                });
                                        })
                                        .catch(error => {
                                            console.log(error);
                                        })
                                }
                            });
                    } else {
                        message.error("La cuota NO existe");
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        } else {
            message.warn("El formato del código no es válido");
        }
    };

    const alternarExoneracionMora = async (record) => {
        await refPagos
            .doc(record.key)
            .update({
                mora_exonerada: !record.mora_exonerada
            })
            .then(() => {
                if (record.mora_exonerada)
                    message.success('¡Se quitó la exoneración de la mora!')
                else
                    message.success('¡Se exoneró la mora correctamente!')
                cargarPagos(record.codigo_contrato)
            })
            .catch(error => {
                console.log(error);
                message.error('Ocurrió un error');
            })
    }

    const eliminarPago = async (record) => {
        let siguienteCancelada = false;
        let numeroCuota = Number.parseInt(record.numero_cuota);
        let ultimaCuotaPagada = null;
        let ultimoMesPagado = null;
        let fechaUltimoMesPagado = null;

        await refContratos // Validar si la siguiente cuota ya fue cancelada
            .doc(record.codigo_contrato)
            .get()
            .then(async (d_contrato) => {
                if (d_contrato.exists) {

                    await d_contrato.ref
                        .collection("cuotas")
                        .doc(zeroPad(numeroCuota + 1, 2))
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

        await refPagos
            .doc(`${record.key}`)
            .delete() // Elimino el pago
            .then(() => {
                refContratos
                    .doc(record.codigo_contrato)
                    .get() // Obtengo el contrato
                    .then(async (contrato) => {
                        if (contrato.exists) {
                            contrato.ref
                                .collection("cuotas")
                                .doc(record.numero_cuota) // Obtengo la cuota del pago
                                .get()
                                .then((cuota) => {
                                    if (cuota.exists) {
                                        cuota.ref
                                            .update({ cancelado: false }) // Actualizo el estado cancelado de la cuota
                                            .then(() => {
                                                cargarPagos(contrato.data().codigo);
                                                message.success("Pago eliminado");
                                            });
                                    }
                                });

                            if (numeroCuota > 1) { // Pendiente
                                await refPagos
                                    .doc(`${record.key.substr(0, 16)}${zeroPad(numeroCuota - 1, 4)}`)
                                    .get()
                                    .then(d_pago => {
                                        let pago = d_pago.data();
                                        ultimaCuotaPagada = pago.numero_cuota;
                                        ultimoMesPagado = pago.fecha_cuota;
                                        fechaUltimoMesPagado = pago.fecha_pago;
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    })
                            }

                            contrato.ref
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
    };

    const cargarContratos = async (codCliente) => {
        setStValidacionContrato("validating");
        setMsgValidacionContrato(null);
        form.setFieldsValue({
            id_contrato: null,
        });
        setPagos([]);
        setContratos([]);

        if (!codCliente) return;

        let auxContratos = [];
        let cliente = clientes.find((cli) => cli.key === codCliente);

        if (!cliente) return;

        await refContratos
            .where("ref_cliente", "==", cliente.ref)
            .where("estado", "==", "activo")
            .get()
            .then((qs) => {
                qs.forEach((doc) => {
                    auxContratos.push({ key: doc.id, ...doc.data() });
                });
                setContratos(auxContratos);
            });

        if (auxContratos.length === 0) {
            setStValidacionContrato("warning");
            setMsgValidacionContrato("No se encontraton contratos");
        } else if (auxContratos.length === 1) {
            form.setFieldsValue({
                id_contrato: auxContratos[0].codigo,
            });
            cargarPagos(auxContratos[0].codigo);
            setStValidacionContrato(null);
        } else {
            setStValidacionContrato(null);
        }

        return true;
    };

    const cargarPagos = async (codigoContrato) => {
        let auxPagos = [];
        let auxCuotas = [];
        let auxSumas = 0;
        let auxMora = 0;

        setSumas(0);
        setMora(0);
        setTotal(0);
        setCuotas([]);
        setPagos([]);
        setContrato(null);

        if (!codigoContrato) return;

        setLoadingPagos(true);

        await refContratos
            .doc(codigoContrato)
            .get()
            .then((doc) => {
                setContrato(doc.data());
            });

        await refPagos
            .where("codigo_contrato", "==", codigoContrato)
            .where("facturado", "==", false)
            .get()
            .then((qs) => {
                qs.forEach((doc) => {
                    let pago = doc.data();
                    pago.ref = doc.ref;
                    pago.key = doc.id;

                    auxCuotas.push({
                        fecha_cuota: pago.fecha_cuota,
                        fecha_pago: pago.fecha_pago,
                        num_cuota: pago.numero_cuota,
                        precio_mora: pago.mora,
                        mora_exonerada: pago.mora_exonerada,
                        cantidad: pago.cantidad,
                    });

                    auxPagos.push(pago);
                    auxSumas += pago.cantidad;

                    if (
                        !pago.mora_exonerada &&
                        pago.fecha_pago &&
                        fechaMayor(pago.fecha_pago, pago.fecha_cuota)
                    ) {
                        auxMora += 3;
                    }
                });

                setCuotas(auxCuotas);
                setPagos(auxPagos);
                setMora(auxMora);
                setSumas(auxSumas);
                setTotal(auxSumas + auxMora);
            });

        setLoadingPagos(false);
    };

    const SelectFecha = (props)  => {
        let { record } = props;
        let fecha = null;
        let mora = 0;

        let selecFechaPago = codigo => {

            if (fecha && fechaMayor(fecha, record.fecha_cuota)) mora = 3;

            refPagos.doc(codigo)
            .update({
                fecha_pago: fecha,
                mora
            })
            .then(() => {
                message.success('¡Fecha establecida correctamente!');
                cargarPagos(record.codigo_contrato);
            })
        }

        return (
            <Space>
                <DatePicker
                    locale={locale}
                    format="DD-MMMM-YYYY"
                    size="small"
                    onChange={ date => { fecha = date ? new Date(date.get()) : null }}
                />
                <CheckCircleOutlined onClick={() => selecFechaPago(record.key)} style={{ color: '#389e0d' }} />
            </Space>
        );
    }

    const columnas = [
        {
            title: "No. Cuota",
            align: 'center',
            dataIndex: "numero_cuota",
        },
        {
            title: "Mes",
            dataIndex: "fecha_cuota",
            render: (fecha_cuota) => <span>{verFecha(fecha_cuota)}</span>,
        },
        {
            title: "Fecha de pago",
            key: "fecha_pago",
            render: (record) => (
                <span>
                    <Row justify="center">
                        <Col>
                            {
                                record.fecha_pago
                                ?
                                ` ${verFecha(record.fecha_pago, true)} `
                                :
                                ''
                            }
                            <Popover
                                content={
                                    <SelectFecha record={record} />
                                }
                                title="Seleccione"
                                trigger="click"
                            >
                                <CalendarOutlined style={{ color: '#1c86c6' }} />
                            </Popover>
                        </Col>
                    </Row>
                </span>
            )
        },
        {
            title: "Precio de cuota",
            dataIndex: "cantidad",
            render: (cantidad) => <strong>{formatoDinero(cantidad)}</strong>,
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
                            record.mora > 0 &&
                            <Tooltip title="Alternar exoneración">
                                <ExceptionOutlined
                                    disabled={record.mora === 0}
                                    key="exonerate"
                                    onClick={() => alternarExoneracionMora(record)}
                                    style={{ color: '#2124ce' }}
                                />
                            </Tooltip>
                        }
                    </Space>
                )
            },
        },
        // {
        //     title: "Mora",
        //     key: "mora",
        //     render: (record) => {
        //         let valor = 0;

        //         if (
        //             record.fecha_pago &&
        //             fechaMayor(record.fecha_pago, record.fecha_cuota)
        //         )
        //             valor = 3;

        //         return (
        //             <Space size='small'>
        //                 <strong>{formatoDinero(valor)}</strong>

        //             </Space>
        //         )
        //     },
        // },
        {
            title: "Cant. gravada",
            key: "cantidad_gravada",
            render: (record) => {
                let cant = record.cantidad;

                if (
                    record.fecha_pago &&
                    fechaMayor(record.fecha_pago, record.fecha_cuota)
                )
                    cant += 3;

                return <strong>{formatoDinero(cant)}</strong>;
            },
        },
        {
            key: 'opciones',
            align: 'center',
            render: (record) => (
                <Space size="middle">
                    <Tooltip title="Cancelar">
                        <StopOutlined key="cancel" onClick={() => eliminarPago(record)} style={{ color: '#f5222d' }} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Modal
            key="data-modal"
            visible={props.visible}
            title={
                <>
                    {props.title}
                    &nbsp;
                    {record && (
                        <span>
                            (<strong>{record.codigo}</strong>)
                        </span>
                    )}
                </>
            }
            onOk={handleOk}
            onCancel={props.handleCancel}
            footer={[
                <div key="footer-options">
                    <Button key="back" onClick={props.handleCancel}>
                        Regresar
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={handleOk}
                    >
                        Guardar
                    </Button>
                </div>,
            ]}
            width={800}
        >
            <Form form={form}>
                <Row>
                    <Col span={12}>
                        <Form.Item
                            name="id_cliente"
                            label="Cliente"
                            rules={[
                                {
                                    required: true,
                                    message: "Seleccione un cliente",
                                },
                            ]}
                            requiredMark="optional"
                        >
                            <Select
                                placeholder="Seleccione un cliente"
                                style={{ width: 245 }}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(codigo) => cargarContratos(codigo)}
                            >
                                {clientes.map((cliente) => (
                                    <Option
                                        key={cliente.key}
                                        value={cliente.key}
                                    >{`${cliente.nombre} ${cliente.apellido}`}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="id_contrato"
                            label="Contrato"
                            rules={[
                                {
                                    required: true,
                                    message: "Seleccione un contrato",
                                },
                            ]}
                            requiredMark="optional"
                            hasFeedback
                            validateStatus={stValidacionContrato}
                            help={msgValidacionContrato}
                        >
                            <Select
                                placeholder="Seleccione un contrato"
                                style={{ width: 245 }}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={(codigo) => cargarPagos(codigo)}
                            >
                                {contratos.map((cont) => (
                                    <Option
                                        key={cont.codigo}
                                        value={cont.codigo}
                                    >{`${cont.codigo}`}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={20}>
                        <Form.Item
                            name="fecha"
                            label="Fecha"
                            rules={[
                                {
                                    required: true,
                                    message: "Fecha requerida",
                                },
                            ]}
                            requiredMark="optional"
                        >
                            <DatePicker
                                placeholder="Fecha"
                                picker="date"
                                format="DD-MMMM-YYYY"
                                locale={locale}
                                // disabledDate={current => {
                                //     return current && current < moment().subtract(1, 'y')
                                // }}
                                onChange={(date) => {
                                    // setFechaInicio(null)
                                    // setFechaFin(null);
                                    // if (!date || !cantCuotas) return;
                                    // date.set('date', 3);
                                    // setFechaInicio(date)
                                    // let fecha = moment(date.get());
                                    // setFechaFin(fecha.add(cantCuotas - 1, 'M'));
                                }}
                                style={{ width: 170 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={9} style={{ textAlign: "right" }}>
                        <strong>Pagos</strong>
                    </Col>
                    <Col span={11} offset={1}>
                        <Input
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 280 }}
                            autoFocus
                            maxLength={24}
                            allowClear
                            value={barcode}
                            onChange={(ev) => setBarcode(ev.target.value)}
                            onKeyUp={(ev) => {
                                if (ev.keyCode === 13) {
                                    agregarPago(ev.target.value);
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={24}>
                        <Table
                            loading={loadingPagos}
                            columns={columnas}
                            dataSource={pagos}
                            footer={() => (
                                <Row>
                                    <Col
                                        style={{ textAlign: "right" }}
                                        span={11}
                                    >
                                        <strong>{pagos.length} cuotas</strong>
                                    </Col>
                                    <Col
                                        style={{ textAlign: "right" }}
                                        span={13}
                                    >
                                        <Space>
                                            <strong
                                                style={{ fontSize: "1.1em" }}
                                            >
                                                Mora: {formatoDinero(mora)}
                                            </strong>
                                            <strong
                                                style={{ fontSize: "1.1em" }}
                                            >
                                                Sumas: {formatoDinero(sumas)}
                                            </strong>
                                        </Space>
                                    </Col>
                                </Row>
                            )}
                            size="small"
                        />
                    </Col>
                </Row>
                <Divider />
                <Row>
                    <Col span={15}>
                        <strong style={{ fontSize: "1.2em" }}>
                            Total a Pagar: {formatoDinero(total)}
                        </strong>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
