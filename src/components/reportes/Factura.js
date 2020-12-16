import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({ family: 'Courier New', src: `${process.env.PUBLIC_URL}/cour.ttf` });

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const styles = StyleSheet.create({
    mainContainer: {
        // border: 1,
        // borderColor: 'red'
        width: 380,
        margin: 8,
    },
    dateContanier: {
        marginTop: 135,
        marginLeft: 295,
    },
    dataValue: {
        fontFamily: 'Courier New',
        fontSize: 11
    },
    nameContainer: {
        marginTop: 15,
        marginLeft: 60,
    },
    descriptionContainer: {
        marginTop: 70,
        display: 'flex',
        flexDirection: 'row',
    },
    quantityColum: {
        // border: 1,
        // borderColor: 'red',
        marginLeft: 10,
        width: 25,
        textAlign: 'center'
    },
    descriptionColumn: {
        // border: 1,
        // borderColor: 'yellow',
        width: 175,
        textOverflow: 'hidden'
    },
    unitPriceColumn: {
        // border: 1,
        // borderColor: 'blue',
        width: 40
    },
    priceValue: {
        fontFamily: 'Courier New',
        fontSize: 9
    },
    taxedSalesColumn: {
        // border: 1,
        // borderColor: 'brown',
        marginLeft: 65,
        width: 50
    },
    finalContainer: {
        // border: 1,
        // borderColor: 'red',
        marginTop: 115,
        marginLeft: 10,
        display: 'flex',
        flexDirection: 'row',
    },
    textTotalContainer: {
        // border: 1,
        // borderColor: 'green',
        marginLeft: 20,
        width: 180
    },
    totalsContainer: {
        display: 'flex',
        // flexDirection: 'col'
    },
    sumsContainer: {
        // border: 1,
        // borderColor: 'red',
        marginLeft: 104,
        width: 50,
        height: 15,
        textAlign: 'center'
    }
});

const Factura = props => {
    console.log(props);

    let { factura } = props;

    return (
        <Document>
            <Page size={[397, 595.2]} style={{ flexDirection: 'row' }}>
                <View style={styles.mainContainer}>
                    <View style={styles.dateContanier}>
                        <Text style={styles.dataValue}>06/10/2020</Text>
                    </View>
                    <View style={styles.nameContainer}>
                        <Text style={styles.dataValue}>{factura.nombre_cliente}</Text>
                    </View>
                    <View style={styles.descriptionContainer}>
                        <View style={styles.quantityColum}>
                            <Text style={styles.dataValue}>{factura.cantidad_pagos}</Text>
                        </View>
                        <View style={styles.descriptionColumn}>
                            <Text style={styles.dataValue}>
                                Servicio de Conexión a
                            </Text>
                            <Text style={styles.dataValue}>
                                Internet de Banda
                            </Text>
                            <Text style={styles.dataValue}>
                                ancha, correspondiente
                            </Text>
                            <Text style={styles.dataValue}>
                                al periodo de:
                            </Text>
                            <Text style={styles.dataValue}>
                                {factura.periodo}
                            </Text>
                        </View>
                        <View style={styles.unitPriceColumn}>
                            <Text style={styles.priceValue}>
                                {formatoDinero(factura.precio_pago)}
                            </Text>
                        </View>
                        <View style={styles.taxedSalesColumn}>
                            <Text style={styles.dataValue}>
                                {formatoDinero(factura.total)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.finalContainer}>
                        <View style={styles.textTotalContainer}>
                            <Text style={styles.dataValue}>{factura.total_letras}</Text>
                        </View>
                        <View style={styles.totalsContainer}>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>{formatoDinero(factura.total)}</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>-</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>-</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>-</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>{formatoDinero(factura.total)}</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>-</Text>
                            </View>
                            <View style={styles.sumsContainer}>
                                <Text style={styles.dataValue}>{formatoDinero(factura.total)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default Factura;
