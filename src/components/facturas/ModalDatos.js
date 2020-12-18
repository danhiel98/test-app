import React, { useState, useEffect } from "react";
import { List, Avatar, message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip, InputNumber } from "antd";
import { DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import "moment/locale/es";
import locale from "antd/es/date-picker/locale/es_ES";
import app from '../../firebaseConfig';
import firebase from 'firebase';

const { Option } = Select;

const opcFecha = { year: 'numeric', month: 'long'};

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const ModalDatos = (props) => {
    const [form] = Form.useForm();
    const { fireRef, record, clientes } = props;

    const [loading, setLoading] = useState(false);
    const [contratos, setContratos] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [red, setRed] = useState(null);
    const [ip, setIP] = useState(null);
    const [stValidacionIP, setStValidacionIP] = useState(null);
    const [msgValidacionIP, setMsgValidacionIP] = useState(null);
    const [cantCuotas, setCantCuotas] = useState(18);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    let refContratos = app.firestore().collection('contratos');
    let refPagos = app.firestore().collection('pagos');
    let refClientes = app.firestore().collection('clientes');
    let refIP = app.firestore().collection('ips');

    useEffect(() => {
        if (!record) {
            form.resetFields();
            return;
        }

        const ref = fireRef.doc(record.key);
        ref.get().then(async (doc) => {
            if (doc.exists) {
                let doc_cliente;
                const contrato = doc.data();

                setRed(contrato.red);
                setIP(contrato.ip);
                setFechaInicio(moment(contrato.fecha_inicio.toDate()))
                setFechaFin(moment(contrato.fecha_fin.toDate()))

                await contrato.ref_cliente.get()
                .then(doc => {
                    doc_cliente = doc;
                })

                form.setFieldsValue({
                    id_cliente: doc_cliente.id,
                    velocidad: contrato.velocidad,
                    precio_cuota: contrato.precio_cuota,
                    red: contrato.red,
                    ip: contrato.ip,
                    cuotas: contrato.cant_cuotas,
                    fecha_inicio: moment(contrato.fecha_inicio.toDate())
                });

            } else {
                console.log(`No se puede obtener el registro`);
            }
        });
    }, [record, clientes, form, fireRef]);

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    const statusIP = async (ref_ip, libre) => {
        await refIP.doc(ref_ip)
            .update({ libre })
            .catch(error => {
                throw error;
            })
    }

    const handleOk = async () => {
        setLoading(true);

        await form.validateFields()
            .then(async val => {
                if (!validarIP()) {
                    setLoading(false);
                    return;
                }

                let cliente = '';
                refClientes = refClientes.doc(val.id_cliente);

                await refClientes
                .get()
                .then(doc => {
                    let data = doc.data();
                    cliente = {
                        id: doc.id,
                        dui: data.dui,
                        nombre: data.nombre,
                        apellido: data.apellido,
                        ref: doc.ref
                    };
                })
                .catch(error => {
                    throw error;
                });

                let contrato = {
                    estado: 'activo',
                    dui_cliente: cliente.dui,
                    cliente: `${cliente.nombre} ${cliente.apellido}`,
                    eliminado: false,
                    cant_cuotas: val.cuotas,
                    precio_cuota: val.precio_cuota,
                    velocidad: val.velocidad,
                    ref_cliente: cliente.ref,
                }

                contrato.codigo = record ? record.codigo : `R${val.red}-${zeroPad(val.ip, 3)}-${fechaInicio.format('MMYY')}-${fechaFin.format('MMYY')}`;

                if (!record) {
                    contrato.fecha_ingreso = firebase.firestore.Timestamp.now();
                    contrato.red = val.red;
                    contrato.ip = Number(val.ip);
                    contrato.fecha_inicio = new Date(fechaInicio);
                    contrato.fecha_fin = new Date(fechaFin);
                }

                if (record) {
                    editarRegistro(contrato)
                    .then(() => {
                        message.success('¡Registro editado correctamente!');
                        form.resetFields();
                        props.handleCancel()
                    })
                    .catch(error => {
                        console.log(`Hubo un error al editar el registro: ${error}`)
                    })
                } else {
                    agregarRegistro(contrato)
                    .then(() => {
                        message.success('¡Se agregó el contrato correctamente!');
                        form.resetFields();
                        props.handleCancel()
                    })
                    .catch(error => {
                        console.log(`Hubo un error al agregar el registro: ${error}`)
                    })
                }
            })
            .catch((info) => {
                console.log(info);
                message.warning('¡Verifique la información ingresada');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const agregarRegistro = async (contrato) => {
        refContratos.doc(`${contrato.codigo}`).set(contrato)
        .then(() => {
            let fechaPago = new Date(fechaInicio);
            fechaPago.setMonth(fechaPago.getMonth() - 1)
            for (let i = 1; i <= cantCuotas; i++) {
                let cuota = {
                    codigo: `${contrato.codigo}-${zeroPad(i, 2)}`,
                    cantidad: contrato.precio_cuota,
                    fecha_pago: new Date(fechaPago.setMonth(fechaPago.getMonth() + 1)),
                    cancelado: false
                }

                refContratos.doc(`${contrato.codigo}`).collection('cuotas').doc(`${zeroPad(i, 2)}`).set(cuota);
            }
        })
        .then(doc => {
            statusIP(`${contrato.red}-${contrato.ip}`, false);
            console.log('Todo bien');
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const editarRegistro = async (contrato) => {
        const ref = fireRef.doc(contrato.codigo);

        await ref.update(contrato).then(async (docRef) => {
            if (contrato.codigo !== record.codigo) await fireRef.doc(record.codigo).delete();

            if (contrato.red !== record.red || contrato.ip !== record.ip) {
                await statusIP(`${record.red}-${record.ip}`, true);
                await statusIP(`${contrato.red}-${contrato.ip}`, false);
            }
            console.log(`El registro fue actualizado`)
        })
        .catch((error) => {
            console.error(`No se pudo editar el registro: ${error}`);
        });
    }

    const validarIP = async () => {
        setStValidacionIP('validating');
        setMsgValidacionIP(null);

        try {
            if (!red) throw new Error('Seleccione la red')
            if (!ip) throw new Error('Introduzca la direccion IP')
            if (ip <= 0 || ip >= 255 || isNaN(ip)) throw new Error('La IP ingresada no es válida')

            await refIP.doc(`${red}-${ip}`)
            .get()
            .then(function(doc) {
                if (doc.exists) {
                    if (doc.data().libre || (record && record.ip === ip)) {
                        setStValidacionIP('success');
                        setMsgValidacionIP(null);
                        return true;
                    } else {
                        throw new Error('La IP ya está en uso')
                    }
                } else {
                    throw new Error('La IP ingresada no es válida')
                }
            })
            .catch(error => {
                throw error;
            });
        } catch (error) {
            setStValidacionIP('error');
            setMsgValidacionIP(error.message);
        }
        return false;
    }

    const cargarContratos = codCliente => {
        form.setFieldsValue({
            'id_contrato': null
        });

        setContratos([]);
        let auxContratos = [];
        let cliente = props.clientes.find(cli => cli.key === codCliente);

        if (!cliente) return;

        refContratos
        .where('ref_cliente', '==', cliente.ref)
        .get()
        .then(qs => {
            qs.forEach(doc => {
                auxContratos.push(doc.data());
            })
            setContratos(auxContratos);
        })
    }

    const cargarPagos = codigoContrato => {
        let auxPagos = [];
        setPagos([]);

        refPagos
        .where('codigo_contrato', '==', codigoContrato)
        .where('facturado', '==', false)
        .get()
        .then(qs => {
            qs.forEach(doc => {
                auxPagos.push(doc.data());
            })
            setPagos(auxPagos);
        });
    }

    return (
        <Modal
            key="data-modal"
            visible={props.visible}
            title={(
                <>
                    {props.title}
                    &nbsp;
                    {
                        record &&
                        <span>
                            (
                            <strong>
                                {record.codigo}
                            </strong>
                            )
                        </span>
                    }
                </>
            )}
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
                                    message: 'Seleccione un cliente',
                                }
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
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={codigo => cargarContratos(codigo)}
                            >
                                {
                                    props.clientes.map(cliente =>
                                        <Option key={cliente.key} value={cliente.key}>{ `${cliente.nombre} ${cliente.apellido}` }</Option>
                                    )
                                }
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
                                    message: 'Seleccione un contrato',
                                }
                            ]}
                            requiredMark="optional"
                        >
                            <Select
                                placeholder="Seleccione un contrato"
                                style={{ width: 245 }}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={codigo => cargarPagos(codigo)}
                            >
                                {
                                    contratos.map(cont =>
                                        <Option key={cont.codigo} value={cont.codigo}>{ `${cont.codigo}` }</Option>
                                    )
                                }
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
                                    message: 'Fecha requerida'
                                }
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
                                onChange={date => {
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
                    <Col span={24}>
                        <strong>Pagos</strong>
                        <List
                            itemLayout="horizontal"
                            dataSource={pagos}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: 'transparent' }} icon={<DollarOutlined style={{ color: '#5595ff' }} />} />}
                                        title={<a href="https://ant.design">{`${item.fecha_cuota.toDate().toLocaleString('es-SV', opcFecha)}`}</a>}
                                        description={`${item.codigo_contrato}-${item.numero_cuota}`}
                                    />
                                    <strong>{formatoDinero(item.cantidad)}</strong>
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalDatos;
