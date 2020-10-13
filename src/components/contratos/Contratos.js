import React, { Component } from 'react';
import { Pagination, Card, Space, Row, Col, PageHeader, Input } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';

const { Search } = Input;

const { Meta } = Card;

class Contratos extends Component
{
    constructor(props){
        super(props);

        this.ref = app.firestore().collection('contratos');
        this.unsubscribe = null;
        this.state = {
            loading: true,
            contratos: [],
            contratosActuales: [],
            totalItems: 0,
            currentPage: 1,
            limit: 8
        };
    }

    obtenerContratos = (querySnapshot) => {
        const contratos = [];
        const { busqueda } = this.state;
        this.setState({ loading: true })
        let totalItems = querySnapshot.docs.length;

        querySnapshot.forEach( async (doc) => {
            const { cliente, activo, codigo, fecha_inicio, fecha_fin, velocidad } = doc.data();

            if 
            (
                busqueda &&
                cliente.toLowerCase().indexOf(busqueda) === -1 &&
                codigo.toLowerCase().indexOf(busqueda) === -1
            ) 
                return;

            contratos.push({
                key: doc.id,
                cliente,
                codigo,
                activo,
                fecha_inicio: new Date(fecha_inicio.seconds * 1000).toLocaleDateString("es-SV"),
                fecha_fin: new Date(fecha_fin.seconds * 1000).toLocaleDateString("es-SV"),
                velocidad
            });
        });

        this.setState({
            contratos,
            loading: false,
            totalItems
        });

        this.contratosPaginados();
    }

    contratosPaginados(page = 1) {
        let { contratos, limit } = this.state;

        let data = contratos.slice((limit * page) - limit, limit * page);

        this.setState({ 
            currentPage: page,
            contratosActuales: data 
        });
    }

    componentDidMount() {
        this.ref.orderBy('fecha_ingreso', 'desc').onSnapshot(this.obtenerContratos);
    }

    componentDidUpdate(prevState, newState) {
        
    }

    buscar(valor) {
        if (valor.toLowerCase() !== this.state.busqueda) {
            this.setState({ busqueda: valor.toLowerCase() })
            this.ref
            .get()
            .then(querySnapshot => this.obtenerContratos(querySnapshot));
        }
    }

    changePage(page) {
        if (page === this.state.currentPage) return

        this.contratosPaginados(page);
    }

    render(){
        const { loading, currentPage, totalItems, limit } = this.state;
        return (
            <div>
                
                <PageHeader
                    className="site-page-header"
                    // onBack={() => null}
                    title="Contratos"
                    subTitle="Lista de contratos"
                    extra={
                        [
                            <Search
                                key="1"
                                placeholder="Buscar"
                                onSearch={value => this.buscar(value) }
                                style={{ width: 200 }}
                            />
                        ]
                    }
                />
                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col span={16}>
                        {
                            !loading && 
                            <Pagination 
                                defaultCurrent={currentPage} 
                                defaultPageSize={limit}
                                total={totalItems} 
                                onChange={value => this.changePage(value)}
                            />
                        }
                    </Col>
                </Row>
                <Row gutter={16}>
                    {
                        loading && 
                        [1,2,3,4,5,6,7,8].map(n => 
                            <Col span={6} key={n}>
                                <Card style={{ marginTop: 16 }} loading={loading} />
                            </Col>
                        )
                    }

                    { this.state.contratosActuales.map(contrato =>
                    <Col span={6} key={contrato.key}>
                        <Card
                            style={{ marginTop: 16 }}
                            actions={[
                                <SettingOutlined key="setting" />,
                                <EditOutlined key="edit" />,
                                <EllipsisOutlined key="ellipsis" />,
                            ]}
                        >
                            <Meta
                                avatar={
                                    <FileTextOutlined style={{ fontSize: '32px'}} />
                                }
                                title={
                                    <Space size="middle">
                                        <strong>{ contrato.codigo }</strong>
                                    </Space>
                                }
                                description={
                                    <div>
                                        <strong>Cliente:</strong> {contrato.cliente} <br />
                                        <strong>Fecha inicio:</strong> {contrato.fecha_inicio}<br />
                                        <strong>Fecha fin:</strong> {contrato.fecha_fin}<br />
                                        <strong>Velocidad: <span color='green'>{contrato.velocidad}Mb</span> </strong>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                    )}
                </Row>
            </div>
        );
    }
}

export default Contratos;
