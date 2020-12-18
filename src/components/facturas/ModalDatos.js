import React, { useState, useEffect } from "react";
import { Space, List, Avatar, message, Row, Col, DatePicker, Select, Form, Input, Modal, Button, Tooltip } from "antd";
import { StopOutlined, BarcodeOutlined, DollarOutlined } from '@ant-design/icons';
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
    const { record, clientes } = props;

    const [loading, setLoading] = useState(false);
    const [contratos, setContratos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [barcode, setBarcode] = useState('');

    let refContratos = app.firestore().collection('contratos');
    let refPagos = app.firestore().collection('pagos');

    useEffect(() => {

    }, []);

    const zeroPad = (num, places) => String(num).padStart(places, '0');

    const handleOk = async () => {
        setLoading(true);


    };

    const agregarPago = async codigo => {
        if (/(R[\d]{1,3})(-|')(\d{1,3})(-|')(\d{4})(-|')(\d{4})(-|')\d{2}/.test(codigo))
        {
            let exist = false;
            let anteriorCancelado = false;
            let codContrato = codigo.substring(0, codigo.length -3);

            await refPagos.doc(codigo)
            .get()
            .then(pago => {
                if (pago.exists) {
                    message.error('¡Esta cuota ya fue cancelada!');
                    exist = true;
                }
            })

            if (exist) return;

            refContratos.doc(codContrato)
            .get()
            .then(async contrato => {
                if (contrato.exists) {
                    let numCuota = Number.parseInt(codigo.substr(-2));

                    if (numCuota > 1) {
                        await contrato.ref.collection('cuotas').doc(`0${numCuota - 1}`)
                        .get()
                        .then(doc => {
                            let cuota = doc.data();
                            if (cuota.cancelado) {
                                anteriorCancelado = true;
                            }
                        })

                        // Si la cuota anterior a esta no ha sido cancelada, entonces no se puede agregar el pago
                        if (!anteriorCancelado) {
                            message.error('La cuota anterior no ha sido cancelada aún');
                            return;
                        }
                    }

                    contrato.ref.collection('cuotas').doc(`0${numCuota}`)
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            let d_cuota = cuota.data();
                            let d_contrato = contrato.data();

                            refPagos.doc(d_cuota.codigo).set({
                                cantidad: d_cuota.cantidad,
                                codigo_contrato: contrato.id,
                                ref_cliente: d_contrato.ref_cliente,
                                nombre_cliente: d_contrato.cliente,
                                numero_cuota: cuota.id,
                                fecha_cuota: d_cuota.fecha_pago,
                                fecha_pago: null,
                                facturado: false,
                                fecha_creacion: firebase.firestore.FieldValue.serverTimestamp()
                            }).then(doc => {
                                cuota.ref.update({ cancelado: true })
                                .then(() => {
                                    setBarcode('');
                                    cargarPagos(d_contrato.codigo);
                                    message.success('Pago registrado');
                                })
                            })
                        }
                    })
                } else {
                    message.error('La cuota NO existe');
                }
            })
        } else {
            message.warn('El formato del código no es válido')
        }
    }

    const eliminarPago = async record => {
        let siguienteCancelada = false;

        await refContratos.doc(record.codigo_contrato)
        .get()
        .then(async d_contrato => {
            if (d_contrato.exists) {
                let numCuota = Number.parseInt(record.numero_cuota);

                await d_contrato.ref.collection('cuotas').doc(zeroPad(numCuota + 1, 2))
                .get()
                .then(d_cuota => {
                    if (d_cuota.exists) {
                        if (d_cuota.data().cancelado){
                            siguienteCancelada = true;
                        }
                    }
                })
            }
        })

        // Si hay un pago más reciente, se debe eliminar ese primero
        if (siguienteCancelada) {
            message.error('Primero debe eliminar los pagos más recientes');
            return;
        }

        await refPagos.doc(`${record.codigo_contrato}-${record.numero_cuota}`)
        .delete()
        .then(() => {
            refContratos.doc(record.codigo_contrato)
            .get()
            .then(contrato => {
                if (contrato.exists) {
                    contrato.ref.collection('cuotas').doc(record.numero_cuota)
                    .get()
                    .then(cuota => {
                        if (cuota.exists) {
                            cuota.ref.update({ cancelado: false })
                            .then(() => {
                                cargarPagos(contrato.data().codigo);
                                message.success('Pago eliminado');
                            })
                        }
                    })
                } else {
                    message.error('La cuota NO existe');
                }
            })
        })
    }

    const cargarContratos = codCliente => {
        form.setFieldsValue({
            'id_contrato': null
        });

        setContratos([]);
        let auxContratos = [];
        let cliente = clientes.find(cli => cli.key === codCliente);

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
                                    clientes.map(cliente =>
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
                    <Col span={9} style={{ textAlign: 'right' }}>
                        <strong>Pagos</strong>
                    </Col>
                    <Col span={11} offset={1}>
                        <Input
                            addonBefore={<BarcodeOutlined />}
                            placeholder="Codigo de cuota"
                            style={{ width: 240 }}
                            autoFocus
                            maxLength={20}
                            allowClear
                            value={barcode}
                            onChange={ev => setBarcode(ev.target.value)}
                            onKeyUp={ev => {
                                if (ev.keyCode === 13) {
                                    agregarPago(ev.target.value);
                                }
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <List
                            itemLayout="horizontal"
                            dataSource={pagos}
                            style={{ height: 250, overflowY: 'auto' }}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: 'transparent' }} icon={<DollarOutlined style={{ color: '#5595ff' }} />} />}
                                        title={<a href="https://ant.design">{`${item.fecha_cuota.toDate().toLocaleString('es-SV', opcFecha)}`}</a>}
                                        description={`${item.codigo_contrato}-${item.numero_cuota}`}
                                    />
                                    <Space>
                                        <strong>{formatoDinero(item.cantidad)}</strong>
                                        <Tooltip title="Cancelar">
                                            <StopOutlined key="cancel" onClick={() => eliminarPago(item)} style={{ color: '#f5222d' }} />
                                        </Tooltip>
                                    </Space>
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
