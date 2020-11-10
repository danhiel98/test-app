import React, { useEffect } from 'react';
import { PDFViewer, Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { useParams } from 'react-router-dom';
import { useBarcode } from '@createnextapp/react-barcode'

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        size: 'LETTER'
    },
    entryContainer: {
        marginBottom: 10,
        marginLeft: 90,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 4,
        padding: 5,
        height: 200
    },
    cardContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    mainContainer: {
        flex: 1,
        paddingTop: 30,
        paddingLeft: 15,
        // border: '1 solid red',
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    },
    date: {
        fontSize: 11,
        // fontFamily: 'Lato Italic',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'row',
        width: 320,
    },
    rightColumn: {
        flexDirection: 'column',
        width: 171,
        marginTop: -6,
        padding: 3,
        borderLeft: 1,
        borderBottom: 1,
        borderColor: '#000'
    },
    rightValues: {
        flexDirection: 'row',
    },
    logo: {
        width: 100,
    },
    title: {
        fontSize: 10,
        color: 'black',
        textDecoration: 'none',
        lineHeight: 1.2,
        fontWeight: 'bold',
        marginTop: 2,
        width: 190,
        // fontFamily: 'Lato Bold',
    },
    subtitle: {
        fontSize: 11,
        color: 'black',
        lineHeight: 1.2,
        fontWeight: 'bold',
        width: 190,
        // fontFamily: 'Lato Bold',
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
        fontSize: 10,
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
        borderColor: '#000'
    },
    leftDataColumn: {
        display: 'flex',
        flexDirection: 'row',
        width: 270,
        // border: 1,
        // borderColor: 'blue'
    },
});

// Create Document Component
const MyDocument = props => {
    let { contrato } = useParams();

    useEffect(() => {
        console.log(contrato);
    }, [contrato])

    return (
        <PDFViewer
            style={{
                width: '100%',
                height: '100%',
                border: 'none'
            }}
        >
            <Document>
                <Page size="LETTER" style={styles.page}>
                    <View style={styles.mainContainer}>
                        <View style={styles.entryContainer}>
                            <View style={styles.cardContainer}>
                                <View style={styles.leftColumn}>
                                    <Image
                                        src={process.env.PUBLIC_URL + '/turbo-mega.png'}
                                        style={styles.logo}
                                    />
                                    <View style={{ paddingLeft: 5 }}>
                                        <Text style={styles.title}>Pago de Servicio de Internet Residencial</Text>
                                        <Text style={styles.subtitle}>Cuenta 10000003012370</Text>
                                        <Text style={styles.numeroCuota}>N° 0001</Text>
                                    </View>
                                </View>
                                <View style={styles.rightColumn}>
                                    <View style={styles.rightValues}>
                                        <Text style={styles.datoPago}>Vencimiento: </Text>
                                        <Text style={styles.fechaVencimiento}>03-agosto-2021</Text>
                                    </View>
                                    <View style={styles.rightValues}>
                                        <Text style={styles.datoPago}>Pago Puntual: </Text>
                                        <Text style={styles.valorPago}>$26.3 </Text>
                                    </View>
                                    <View style={styles.rightValues}>
                                        <Text style={styles.datoPago}>Pago Tardío: </Text>
                                        <Text style={styles.valorPago}>$29.3 </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.customerContainer}>
                                <Text style={styles.field}>Nombre del cliente: </Text>
                                <Text style={styles.value}>Reynaldo Adiel Herrera Chávez</Text>
                            </View>
                            <View style={styles.cardContainer}>
                                <View style={styles.leftDataColumn}>
                                    <View>
                                        <View style={styles.customerContainer}>
                                            <Text style={styles.field}>DUI: </Text>
                                            <Text style={styles.duiValue}>05725690-3</Text>
                                        </View>
                                        <View style={styles.customerContainer}>
                                            {/* <Image source={} /> */}
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.rightDataColumn}>

                                </View>
                            </View>
                        </View>
                    </View>
                </Page>
            </Document>
        </PDFViewer>
    );
}

export default MyDocument;
