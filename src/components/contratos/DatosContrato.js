import React, { useState, useEffect } from 'react';
import {Badge, Space, Modal, Button} from 'antd';
import {FileTextOutlined } from '@ant-design/icons';

const DatosContrato = (props) => {
    const [loading, setLoading] = useState(true);

    let { contrato } = props;

    return (
        <Modal
            key="data-modal"
            visible={props.visible}
            title={
                <Space>
                    <FileTextOutlined style={{ fontSize: '25px'}} />
                    <strong>{ contrato.codigo }</strong>
                    <Badge count={`${contrato.velocidad} MB`} style={{ backgroundColor: '#52c41a' }} />
                </Space>
            }
            width={400}
            onCancel={props.handleCancel}
            footer={[
                <div key="footer-options">
                    {/* <Button key="back" onClick={props.handleCancel}>
                        Regresar
                    </Button> */}
                </div>
            ]}
        >
            <>
                <h3>Cliente: <a href="#">{ contrato.cliente }</a></h3>
                <h3>Inicio: <strong>{ contrato.fecha_inicio }</strong></h3>
                <h3>Fin: <strong>{ contrato.fecha_fin }</strong></h3>
                <h3>Cuota: <strong>${ contrato.precio_cuota }</strong></h3>
                <h3><a href="#">Ver cuotas</a></h3>
            </>
        </Modal>
    );
}

export default DatosContrato;