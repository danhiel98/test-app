import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({ family: 'Courier New', src: `${process.env.PUBLIC_URL}/cour.ttf` });

const opcFecha = { year: "numeric", month: "long" };
const opcFecha2 = { year: "numeric", month: "long", day: "numeric" };

const verFecha = (fecha, todo = false) => {
    let opc = todo ? opcFecha2 : opcFecha;
    return fecha.toDate().toLocaleString("es-SV", opc);
};

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const styles = StyleSheet.create({
    mainContainer: {
        // border: 1,
        // borderColor: 'red',
        width: 380,
        margin: 8,
    },
    dateContanier: {
        marginTop: 115,
        marginLeft: 285,
    },
    dataValue: {
        fontFamily: 'Courier New',
        fontSize: 11
    },
    descriptionValue: {
        fontFamily: 'Courier New',
        fontSize: 8.4
    },
    nameContainer: {
        marginTop: 15,
        marginLeft: 60,
    },
    descriptionContainer: {
        // border: 1,
        // borderColor: 'blue',
        marginTop: 5,
        display: 'flex',
        flexDirection: 'row',
    },
    quantityColum: {
        // border: 1,
        // borderColor: 'purple',
        marginLeft: 10,
        width: 25,
        // textAlign: 'center'
    },
    divider: {
        marginTop: 75,
    },
    descriptionColumn: {
        // border: 1,
        // borderColor: 'yellow',
        width: 185,
        paddingRight: 5,
        textOverflow: 'hidden'
    },
    unitPriceColumn: {
        // border: 1,
        // borderColor: 'blue',
        width: 40,
        textAlign: 'center'
    },
    priceValue: {
        fontFamily: 'Courier New',
        fontSize: 9
    },
    taxedSalesColumn: {
        // border: 1,
        // borderColor: 'brown',
        marginLeft: 'auto',
        marginRight: 15,
        width: 50
    },
    finalContainer: {
        // border: 1,
        // borderColor: 'red',
        position: 'absolute',
        marginTop: 430,
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

const Item = props => {
    const { pago } = props;

    return (
        <View style={styles.descriptionContainer}>
            <View style={styles.quantityColum}>
                <Text style={styles.dataValue}>1</Text>
            </View>
            <View style={styles.descriptionColumn}>
                <Text style={styles.descriptionValue}>
                    Pago de servicio de internet del mes de {verFecha(pago.fecha_cuota)}
                </Text>
            </View>
            <View style={styles.unitPriceColumn}>
                <Text style={styles.priceValue}>
                    {formatoDinero(pago.cantidad)}
                </Text>
            </View>
            <View style={styles.taxedSalesColumn}>
                <Text style={styles.dataValue}>
                    {formatoDinero(pago.cantidad)}
                </Text>
            </View>
        </View>
    )
}

const Factura = props => {
    let { factura } = props;

    let pagosMoraEx = factura.cuotas.filter(cuota => cuota.mora_exonerada && cuota.precio_mora > 0);
    let pagosMora = factura.cuotas.filter(cuota => !cuota.mora_exonerada && cuota.precio_mora > 0);
    let cantPagosMora = pagosMora.length;
    let cantPagosMoraEx = pagosMoraEx.length;
    let datoMora = null;
    let mesesMora = '';
    let mesesMoraEx = '';

    if (cantPagosMora > 0) {
        datoMora = {
            cantidad: cantPagosMora,
            precioUnitario: 3,
            total: cantPagosMora * 3
        };

        pagosMora.forEach((pago, idx) => {
            mesesMora += pago.fecha_cuota.toDate().toLocaleDateString('es-SV', { month: 'long', year: 'numeric' })
            if (idx + 1 < cantPagosMora) mesesMora += ', '
        })

    }

    if (cantPagosMoraEx > 0) {
        pagosMoraEx.forEach((pago, idx) => {
            mesesMoraEx += pago.fecha_cuota.toDate().toLocaleDateString('es-SV', { month: 'long', year: 'numeric' })
            if (idx + 1 < cantPagosMoraEx) mesesMoraEx += ', '
        })
    }

    return (
        <Document>
            <Page size={[397, 595.2]} style={{ flexDirection: 'row' }}>
                <View style={styles.mainContainer}>
                    <View style={styles.dateContanier}>
                        <Text style={styles.dataValue}>{factura.fecha.toDate().toLocaleDateString('es-SV', { year: "numeric", month: "numeric", day: "numeric" })}</Text>
                    </View>
                    <View style={styles.nameContainer}>
                        <Text style={styles.dataValue}>{factura.nombre_cliente}</Text>
                    </View>
                    <View style={styles.divider} />
                    {
                        factura.cuotas.map(cuota => (
                            <Item
                                key={cuota.num_cuota}
                                pago={cuota}
                            />
                        ))
                    }
                    {
                        cantPagosMora > 0 &&
                        <View style={styles.descriptionContainer}>
                            <View style={styles.quantityColum}>
                                <Text style={styles.dataValue}>{cantPagosMora}</Text>
                            </View>
                            <View style={styles.descriptionColumn}>
                                <Text style={styles.descriptionValue}>
                                    { `Pago de mora de ${mesesMora}` }
                                </Text>
                            </View>
                            <View style={styles.unitPriceColumn}>
                                <Text style={styles.priceValue}>
                                    {formatoDinero(datoMora.precioUnitario)}
                                </Text>
                            </View>
                            <View style={styles.taxedSalesColumn}>
                                <Text style={styles.dataValue}>
                                    {formatoDinero(datoMora.total)}
                                </Text>
                            </View>
                        </View>
                    }
                    {
                        cantPagosMoraEx > 0 &&
                        <View style={styles.descriptionContainer}>
                            <View style={styles.quantityColum}>
                                <Text style={styles.dataValue}></Text>
                            </View>
                            <View style={styles.descriptionColumn}>
                                <Text style={styles.descriptionValue}>
                                    { `Mora exonerada de ${mesesMoraEx}` }
                                </Text>
                            </View>
                        </View>
                    }

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
