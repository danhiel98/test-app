import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
]

const verFecha = fecha => {
    fecha = fecha.toDate();
    return `${fecha.getDate()}-${months[fecha.getMonth()]}-${fecha.getFullYear()}`;
}

const styles = StyleSheet.create({
    entryContainer: {
        marginTop: 20,
        marginBottom: 5,
        marginLeft: 90,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
        padding: 5,
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    mainContainer: {
        flex: 1,
        paddingLeft: 15,
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'row',
        width: 320,
    },
    rightColumn: {
        flexDirection: 'column',
        width: 165,
        marginTop: -6,
        padding: 3,
        borderLeft: 1,
        borderBottom: 1,
        borderColor: '#000'
    },
    rightValues: {
        flexDirection: 'row',
    },
    barcode: {
        height: 45,
        width: 160,
        marginLeft: 98,
        marginTop: 4
    },
    title: {
        fontSize: 10,
        color: 'black',
        textDecoration: 'none',
        lineHeight: 1.2,
        fontWeight: 'bold',
        marginTop: 2,
        width: 190,
    },
    subtitle: {
        fontSize: 11,
        color: 'black',
        lineHeight: 1.2,
        fontWeight: 'bold',
        width: 190,
    },
    numeroCuota: {
        fontSize: 11,
        color: 'black',
        lineHeight: 1.2,
        fontWeight: 'bold',
        width: 190,
        paddingLeft: 40
    },
    datoPago: {
        fontSize: 11,
        color: 'black',
        lineHeight: 1.3,
        textDecoration: 'none',
        width: 75,
    },
    valorPago: {
        fontSize: 10,
        color: 'black',
        textDecoration: 'none',
        width: 68,
        height: 14,
        border: 1,
        paddingLeft: 10,
        borderColor: '#000'
    },
    fechaVencimiento: {
        fontSize: 9,
        color: 'red',
        textDecoration: 'none',
        width: 95,
    },
    customerContainer: {
        display: 'flex',
        flexDirection: 'row',
    },
    field: {
        fontSize: 11,
        marginTop: 3,
        color: 'black',
        lineHeight: 1.3,
        textDecoration: 'none',
        width: 150,
        textAlign: 'right',
        padding: 2,
        paddingRight: 5,
    },
    duiField: {
        fontSize: 11,
        marginTop: 7,
        color: 'black',
        lineHeight: 1.3,
        textDecoration: 'none',
        width: 150,
        textAlign: 'right',
        padding: 2,
        paddingRight: 5,
    },
    value: {
        fontSize: 11,
        padding: 2,
        width: 310,
        height: 20,
        paddingLeft: 5,
        border: 1,
        borderColor: '#000'
    },
    duiValue: {
        fontSize: 11,
        padding: 2,
        width: 110,
        height: 20,
        paddingLeft: 5,
        border: 1,
        borderColor: '#000',
        marginTop: 5
    },
    leftDataColumn: {
        display: 'flex',
        flexDirection: 'row',
        width: 270,
    },
    rightDataColumn: {
        border: 1,
        color: 'red',
        marginTop: 3,
        height: 65,
        width: 190,
        marginBottom: 3
    }
});

const Entry = props => {
    const { cuota, cliente, dui } = props;

    return (
        <View break={cuota.next} style={styles.entryContainer}>
            <View style={styles.cardContainer}>
                <View style={styles.leftColumn}>
                    <Image
                        src={process.env.PUBLIC_URL + '/turbo-mega-reporte.png'}
                        style={{ width: 100 }}
                    />
                    <View style={{ paddingLeft: 5 }}>
                        <Text style={styles.title}>Pago de Servicio de Internet Residencial</Text>
                        <Text style={styles.subtitle}>Cuenta 10000003012370</Text>
                        <Text style={styles.numeroCuota}>N° 00{cuota.id}</Text>
                    </View>
                </View>
                <View style={styles.rightColumn}>
                    <View style={styles.rightValues}>
                        <Text style={styles.datoPago}>Vencimiento: </Text>
                        <Text style={styles.fechaVencimiento}>{verFecha(cuota.fecha_pago)}</Text>
                    </View>
                    <View style={styles.rightValues}>
                        <Text style={styles.datoPago}>Pago Puntual: </Text>
                        <Text style={styles.valorPago}>${cuota.cantidad} </Text>
                    </View>
                    <View style={styles.rightValues}>
                        <Text style={styles.datoPago}>Pago Tardío: </Text>
                        <Text style={styles.valorPago}>${cuota.cantidad + 3} </Text>
                    </View>
                </View>
            </View>
            <View style={styles.customerContainer}>
                <Text style={styles.field}>Nombre del cliente: </Text>
                <Text style={styles.value}>{cliente}</Text>
            </View>
            <View style={styles.cardContainer}>
                <View style={styles.leftDataColumn}>
                    <View>
                        <View style={styles.customerContainer}>
                            <Text style={styles.duiField}>DUI: </Text>
                            <Text style={styles.duiValue}>{dui}</Text>
                        </View>
                        <View style={styles.customerContainer}>
                            <Image
                                style={styles.barcode}
                                src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${cuota.codigo}&scale=2&includetext`}
                            />
                        </View>
                    </View>
                </View>
                <View>
                    <View style={styles.rightDataColumn} />
                    <Text style={{ fontSize: 10, marginLeft: 70, color: 'blue' }}>
                        ORIGINAL
                    </Text>
                </View>
            </View>
            <View>
                <Text style={{ fontSize: 8.5 }}>
                    Para evitar desconexiones del servicio de internet, has tus pagos en las fechas establecidas, así evitarás pago de reconexión
                </Text>
            </View>
        </View>
    );
}

const ordenarCuotas = cuotas => {
    let result = []
    let chunks = []
    let next = false;
    let cntPages = Math.ceil(cuotas.length / 3);

    for (let i = 0; i < cntPages * 3; i += cntPages) {
        chunks.push(cuotas.slice(i, i + cntPages))
    }

    for (let i = 0; i < cntPages; i++) {
        for (let j = 0; j < 3; j++) {
            if (chunks[j][i]) {
                result.push({
                    ...chunks[j][i],
                    next
                })
            }
            next = false;
        }
        next = true;
    }

    return result;
}

const Talonario = props => {
    let { contrato, cuotas } = props;
    let cuotasOrdenadas = [];

    cuotasOrdenadas = ordenarCuotas(cuotas);

    return (
        <Document>
            <Page size="LETTER" style={{ flexDirection: 'row', size: 'LETTER' }} wrap>
                <View style={styles.mainContainer}>
                    {
                        cuotasOrdenadas.map((cuota) =>
                            <Entry
                                key={cuota.id}
                                cuota={cuota}
                                cliente={contrato.cliente}
                                dui={contrato.dui_cliente}
                            />
                        )
                    }
                </View>
            </Page>
        </Document>
    );
}

export default Talonario;
