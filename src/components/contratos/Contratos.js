import React, { Component } from 'react';
import { Tooltip, Badge, Space, PageHeader, Input, Button } from 'antd';
import { EditOutlined, StopOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Tabla from '../Tabla';
import ModalDatos from './ModalDatos';
import ModalDetalle from './ModalDetalle';

const { Search } = Input;

class Contratos extends Component {
    constructor(props) {
        super(props);

        this.refContratos = app.firestore().collection('contratos');
        this.refClientes = app.firestore().collection('clientes');
        this.refRedes = app.firestore().collection('redes');
        this.opcFecha = { year: 'numeric', month: 'short' };
        this.networks = [];

        this.unsubscribe = null;
        this.state = {
            loading: true,
            contratos: [],
            clientes: [],
            redes: [],
            visible: false,
            registro: null,
            modalDetalle: false
        };
    }

    obtenerContratos = (querySnapshot) => {
        const contratos = [];
        const { busqueda } = this.state;

        querySnapshot.forEach(async (doc) => {
            let { cliente, activo, codigo, fecha_inicio, fecha_fin, velocidad, cant_cuotas, precio_cuota, red, ip } = doc.data();

            fecha_inicio = this.verFecha(fecha_inicio);
            fecha_fin = this.verFecha(fecha_fin);

            if
            (
                busqueda &&
                cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_inicio.toLowerCase().indexOf(busqueda) === -1 &&
                fecha_fin.toLowerCase().indexOf(busqueda) === -1
            )
                return;

            contratos.push({
                key: doc.id,
                cliente,
                codigo,
                activo,
                fecha_inicio,
                fecha_fin,
                velocidad,
                cant_cuotas,
                precio_cuota,
                red,
                ip
            });
        });
        this.setState({
            contratos,
            loading: false,
        });
    }

    obtenerRedes = querySnapshot => {
        const redes = [];

        querySnapshot.forEach(doc => {
            let { numero } = doc.data();

            redes.push({
                key: doc.id,
                numero: numero
            });
        });

        this.networks = redes;
        this.setState({
            redes
        });
    }

    obtenerClientes = querySnapshot => {
        const clientes = [];

        querySnapshot.forEach(doc => {
            let { dui, nombre, apellido } = doc.data();

            clientes.push({
                key: doc.id,
                dui,
                nombre,
                apellido
            });
        });

        this.setState({
            clientes
        });
    }

    componentDidMount() {
        this.unsubscribe = this.refContratos.orderBy('fecha_ingreso', 'desc').onSnapshot(this.obtenerContratos);
        this.refClientes.orderBy('fecha_creacion', 'desc').onSnapshot(this.obtenerClientes);
        this.refRedes.orderBy('numero').onSnapshot(this.obtenerRedes);
    }

    componentDidUpdate(prevState, newState) {

    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ loading: true })
            this.setState({ busqueda: valor.toLowerCase() })
            this.refContratos
                .get()
                .then(querySnapshot => this.obtenerContratos(querySnapshot));
        }
    }

    modalData = (record) => {
        this.setState({
            visible: true,
            registro: record
        })
    }

    handleCancel = () => {
        this.setState({
            registro: null,
            modalDetalle: false,
            visible: false
        })
    }

    capitalize = s => {
        if (typeof s !== 'string') return s
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    verFecha = fecha => {
        return this.capitalize(new Date(fecha.seconds * 1000).toLocaleDateString("es-SV", this.opcFecha))
    }

    irA = ruta => {
        this.unsubscribe();
        this.props.dispatch(push(`contratos/${ruta}`));
    }

    verDetalle = record => {
        this.setState({ registro: record });
        this.setState({ modalDetalle: true });
    }

    columnas = this.asignarColumnas();

    asignarColumnas() {
        return [
            {
                title: 'Código',
                key: 'codigo',
                sorter: {
                    compare: (a, b) => a.codigo - b.codigo,
                    multiple: 2,
                },
                filters: [],
                onFilter: (value, record) => record.codigo.indexOf(value) === 0,
                render: record => (
                    <Button type="link" onClick={() => this.verDetalle(record)}>
                        <strong>{ record.codigo }</strong>
                    </Button>
                )
            },
            {
                title: 'Cliente',
                dataIndex: 'cliente',
                sorter: {
                    compare: (a, b) => a.cliente - b.cliente,
                    multiple: 1,
                }
            },
            {
                title: 'Velocidad',
                dataIndex: 'velocidad',
                sorter: true,
                filters: [],
                onFilter: (value, record) => record.velocidad === value,
                render: velocidad => (
                    <>
                        <Badge count={`${velocidad} Mb`} style={{ backgroundColor: '#52c41a' }} />
                    </>
                )
            },
            {
                title: 'Precio',
                dataIndex: 'precio_cuota',
                sorter: true,
                render: precio_cuota => (
                    <>
                        <strong>
                            <span style={{ color: '#089D6C', fontSize: '1.2em' }}>${precio_cuota}</span>
                        </strong>
                    </>
                )
            },
            {
                title: 'Fecha inicio',
                dataIndex: 'fecha_inicio'
            },
            {
                title: 'Fecha fin',
                dataIndex: 'fecha_fin'
            },
            {
                title: 'Opciones',
                key: 'opciones',
                render: (record) => (
                    <Space size="middle">
                        <Tooltip title="Descargar">
                            <CloudDownloadOutlined key="download" onClick={() => console.log('download')} style={{ color: '#389e0d' }} />
                        </Tooltip>
                        <Tooltip title="Editar">
                            <EditOutlined key="edit" onClick={() => this.modalData(record)} style={{ color: '#fa8c16' }} />
                        </Tooltip>
                        <Tooltip title="Cancelar">
                            <StopOutlined key="cancel" onClick={() => console.log('cancel')} style={{ color: '#f5222d' }} />
                        </Tooltip>
                    </Space>
                )
            }
        ]
    }

    render() {
        const {
            contratos,
            loading,
            visible,
            registro,
            clientes,
            redes,
            modalDetalle
        } = this.state;

        return (
            <div>
                {
                    visible &&
                    <ModalDatos
                        visible={visible}
                        title={registro ? 'Editar información' : 'Nuevo contrato'}
                        clientes={clientes}
                        redes={redes}
                        handleCancel={this.handleCancel}
                        record={registro}
                        fireRef={this.refContratos}
                    />
                }
                {
                    modalDetalle &&
                    <ModalDetalle
                        visible={modalDetalle}
                        record={registro}
                        handleCancel={this.handleCancel}
                    />
                }
                <PageHeader
                    className="site-page-header"
                    title="Contratos"
                    subTitle="Lista de contratos"
                    extra={
                        [
                            <Search
                                key="1"
                                placeholder="Buscar"
                                onSearch={value => this.buscar(value)}
                                style={{ width: 200 }}
                            />,
                            <Button key="2" type="primary" ghost onClick={() => this.modalData()}>
                                Nuevo
                            </Button>
                        ]
                    }
                />
                {
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
                    contratos.map(contrato => contrato.velocidad)
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort((a, b) => a - b) // eslint-disable-next-line
                    .map(velocidad => {
                        this.columnas[2].filters.push({
                            text: `${velocidad} Mb`,
                            value: velocidad
                        });
                    })
                }
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
        user: state.user
    }
}

export default connect(mapStateToProps)(Contratos);
