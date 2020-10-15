import React, { Component } from 'react';
import { Badge, Pagination, Card, Space, Row, Col, PageHeader, Input, Button, Empty } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import app from '../../firebaseConfig';

const { Search } = Input;

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
            this.setState({ loading: true })
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
        const { loading, currentPage, totalItems, limit, contratosActuales, busqueda } = this.state;
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
                            />,
                            <Button key="2" type="primary" ghost>
                                Nuevo
                            </Button>
                        ]
                    }
                />
                <Row style={{ marginTop: 20 }} justify="end">
                    <Col>
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
                <Row gutter={16} style={{ padding: '10px' }}>
                    {
                        loading && 
                        [1,2,3,4,5,6,7,8].map(n => 
                            <Col span={6} key={n}>
                                <Card style={{ marginTop: 16 }} loading={loading} />
                            </Col>
                        )
                    }

                    { !loading && contratosActuales.map(contrato =>
                    <Col span={6} key={contrato.key}>
                        <Card
                            style={{ marginTop: 16, boxShadow: '-3px 3px 10px gray', borderRadius: '10px 10px 0px 0px' }}
                            actions={[
                                <SettingOutlined key="setting" />,
                                <EditOutlined key="edit" />,
                                <EllipsisOutlined key="ellipsis" />,
                            ]}
                            title={
                                <Space size="middle">
                                    <FileTextOutlined style={{ fontSize: '25px'}} />
                                    <strong>{ contrato.codigo }</strong>
                                </Space>
                            }
                        >
                            <div>
                                <strong>Cliente:</strong> {contrato.cliente} <br />
                                <strong>Fecha inicio:</strong> {contrato.fecha_inicio}<br />
                                <strong>Fecha fin:</strong> {contrato.fecha_fin}<br />
                                <strong>Velocidad (MB):</strong> <Badge count={contrato.velocidad} style={{ backgroundColor: '#52c41a' }} />
                            </div>
                        </Card>
                    </Col>
                    )}
                </Row>
                {
                    (!loading && contratosActuales.length === 0) &&
                        <Empty
                            imageStyle={{
                                height: 100,
                            }}
                            description={
                            <span>
                                No hay datos
                            </span>
                            }
                        >
                            {
                                busqueda
                                ?
                                <Button type="primary" ghost onClick={() => this.buscar('')}>Restablecer búsqueda</Button>
                                :
                                <Button type="primary" ghost>Registrar un nuevo contrato</Button>
                            }
                        </Empty>
                }
            </div>
        );
    }
}

export default Contratos;
