import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const NumerosALetras = require('../../NumerosALetras');

Font.register({ family: 'Calibri Light', src: `${process.env.PUBLIC_URL}/calibril.ttf` });
Font.register({ family: 'Calibri Bold', src: `${process.env.PUBLIC_URL}/calibrib.ttf` });

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const opcFecha = { year: "numeric", month: "long" };

const verFecha = (fecha) => fecha.toDate().toLocaleString("es-SV", opcFecha);

const styles = StyleSheet.create({
    body: {
        paddingTop: 5,
        paddingBottom: 65,
        paddingHorizontal: 35,
        fontFamily: 'Calibri Light'
    },
    header: {
        marginHorizontal: 10,
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
    },
    headerImage: {
        width: 100,
        height: 45,
        opacity: '0.6',
    },
    headerText: {
        fontSize: 9,
        marginLeft: 'auto',
        paddingVertical: 15,
        marginRight: 0,
        opacity: '0.6',
    },
    title: {
        marginVertical: 5,
        fontSize: 14,
        fontFamily: 'Calibri Bold',
        textAlign: 'center',
        textDecoration: 'underline'
    },
    textContainer: {
        marginTop: 15,
        marginHorizontal: 48,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    text: {
        fontSize: 11,
        textAlign: 'justify',
    },
    textValue: {
        fontFamily: 'Calibri Bold',
        textDecoration: 'underline',
    },
    subtitle: {
        width: '100%',
        fontSize: 11,
        marginVertical: 14,
        fontFamily: 'Calibri Bold',
        textDecoration: 'underline',
    },
    listContainer: {
        marginVertical: 8,
        marginLeft: 20,
        flexDirection: 'row'
    },
    sublistContainer: {
        marginVertical: 6,
        marginLeft: 40,
        flexDirection: 'row'
    },
    orderedListContainer: {
        marginVertical: 5,
        marginLeft: 55,
        flexDirection: 'row'
    },
    otherListContainer: {
        marginVertical: 5,
        marginLeft: 75,
        flexDirection: 'row'
    },
    itemDecoration: {
        fontSize: 11,
        width: 18,
        // fontFamily: 'Calibri Bold'
    },
    listItem: {
        width: '100%',
        fontSize: 11,
        fontFamily: 'Calibri Bold',
    },
    sublistItem: {
        fontSize: 11,
    },
    orderedListItem: {
        fontSize: 11
    },
    signContainer: {
        marginTop: 100,
        marginHorizontal: 45,
        flexDirection: 'row'
    },
    signItem: {
        fontFamily: 'Calibri Light',
        fontSize: 10,
        width: 250,
        marginRight: 10,
        flexDirection: 'col'
    }
});

const Contrato = props => {
    let { contrato, cliente } = props;

    return (
        <Document>
            <Page size="LETTER" style={styles.body} wrap>
                <View style={styles.header} fixed>
                    <Text>
                        Logo de negocio
                    </Text>
                    {/* <Image
                        src={process.env.PUBLIC_URL + '/turbo-mega-reporte.png'}
                        style={styles.headerImage}
                    /> */}
                    <Text style={styles.headerText}>
                        Contrato de Servicios de Internet Inal??mbrico
                    </Text>
                </View>
                <Text style={styles.title}>
                    CONTRATO DE PRESTACI??N DE SERVICIOS DE INTERNET INAL??MBRICO
                </Text>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        Se hace constar por el presente Contrato,
                        la prestaci??n de servicios de conexi??n a internet
                        via inal??mbrica que suscriben por una parte a:&nbsp;
                        <Text style={styles.textValue}>[Nombre]</Text>
                        , identificado con DUI: N??&nbsp;
                        <Text style={styles.textValue}>[DUI]</Text>
                        , y N?? DE REGISTRO TRIBUTARIO:&nbsp;
                        <Text style={styles.textValue}>[NIT]</Text>
                        , inscrito en el Registro de Contribuyentes, con domicilio en&nbsp;
                        <Text style={styles.textValue}>[Direcci??n]</Text>
                        , a quien en adelante se llamar??&nbsp;
                        <Text style={styles.textValue}>EL PROVEEDOR</Text>
                        , por la otra parte,&nbsp;
                        <Text style={styles.textValue}>{contrato.cliente}</Text>
                        &nbsp;con N?? de DUI:&nbsp;
                        <Text style={styles.textValue}>{contrato.dui_cliente}</Text>
                        , y con n??mero de identificaci??n tributaria (NIT):&nbsp;
                        <Text style={styles.textValue}>{cliente.nit}</Text>
                        , con domicilio en&nbsp;
                        <Text style={styles.textValue}>{cliente.direccion}</Text>
                        , a quien en adelante se llamar??&nbsp;
                        <Text style={styles.textValue}>EL CLIENTE</Text>&nbsp;
                        en los t??rminos y condiciones siguientes:
                    </Text>
                    <Text style={styles.subtitle}>
                        PRIMERO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                            PARTES INVOLUCRADAS
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            ???
                        </Text>
                        <Text style={styles.sublistItem}>
                            EL PROVEEDOR, es un comerciante especializado en brindar servicios de <Text style={{ textDecoration: 'underline' }}>INTERNET INALAMBRICO</Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            ???
                        </Text>
                        <Text style={styles.sublistItem}>
                            EL CLIENTE es un consumidor cuyo objeto es el uso personal del servicio
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        SEGUNDO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                            TIPO DE SERVICIO
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        El objeto del presente contrato es pactar entre el&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL PROVEEDOR</Text>
                        &nbsp;y&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>&nbsp;
                        la contrataci??n del servicio remunerado espec??fico siguiente:
                    </Text>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            ???
                        </Text>
                        <Text style={styles.sublistItem}>
                        	Servicios de conexi??n de internet a traves de red inalambrica, utilizando equipo de ??ltima tecnolog??a.
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        TERCERO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                        	VIGENCIA Y TIPO DE PRESTACI??N
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        El presente contrato tendr?? vigencia desde&nbsp;
                        <Text style={styles.textValue}>{verFecha(contrato.fecha_inicio)}</Text>
                        &nbsp;hasta&nbsp;
                        <Text style={styles.textValue}>{verFecha(contrato.fecha_fin)}</Text>
                        , brindando el proveedor una velocidad de conexi??n inal??mbrica de&nbsp;
                        <Text style={styles.textValue}>
                            {NumerosALetras.default(contrato.velocidad, false)}
                            &nbsp;Megabits ({contrato.velocidad}) Mbps.
                        </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        CUARTO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                        	CUOTAS
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        La prestaci??n pactada de com??n acuerdo que&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                        &nbsp;se compromete a pagar durante Diesiocho cuotas al&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>PROVEEDOR</Text>
                        , es de&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>{NumerosALetras.default(contrato.precio_cuota)} am??ricanos ({formatoDinero(contrato.precio_cuota)})</Text>
                        , en concepto de pago por los servicios de conexi??n a internet inal??mbrico.
                    </Text>
                    <Text style={styles.subtitle}>
                        QUINTO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                        	OBLIGACIONES
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        Sin perjuicio de otras obligaciones expresamente estipuladas y/o derivadas del presente contrato, las partes tienen las siguientes obligaciones principales:
                    </Text>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            ???
                        </Text>
                        <Text style={styles.listItem}>
                            PROVEEDOR:
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            1.
                        </Text>
                        <Text style={styles.orderedListItem}>
                            Se compromete a brindar el equipo tecnol??gico necesario para la prestaci??n del servicio de conexi??n inalambrica a internet.
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            2.
                        </Text>
                        <Text style={styles.orderedListItem}>
                            Brindar el servicio de internet mensualmente para un numero de equipos ilimitados conectados simultaneamente (Telefonos, tablet, laptop y/o computadoras de escritorio) de uso personal
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            3.
                        </Text>
                        <Text style={styles.orderedListItem}>
                            Se compromete a prestar el servicio de soporte en forma diligente, para lo cual podr?? valerse de personal calificado.
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                4.
                            </Text>
                        </Text>
                        <Text style={styles.orderedListItem}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                En caso de presentar fallas en el servicio, habr?? un lapso de 3 dias h??biles para su reparaci??n despu??s de haber hecho el reporte de falla.
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                5.
                            </Text>
                        </Text>
                        <Text style={styles.orderedListItem}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                En caso de fallas por desastres Naturales en los lugares de repetici??n la fecha de reparaci??n sera indifinidad.
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            ???
                        </Text>
                        <Text style={styles.listItem}>
                            CLIENTE:
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            1.
                        </Text>
                        <Text style={styles.orderedListItem}>
                        	Se compromete a cancelar el precio mensual contemplado en el presente contrato, en la ubicaci??n asignada para ello, as?? como las fechas destinadas.
                        </Text>
                    </View>
                    <View style={styles.otherListContainer}>
                        <Text style={styles.itemDecoration}>
                            a.
                        </Text>
                        <Text style={styles.orderedListItem}>
                            El servicio se cancelar?? mensualmente durante los {contrato.cant_cuotas} meses de vigencia del contrato entre los dias  1 y 3 de cada mes, en  la Agencia de: BANCO PROMERICA, sucursal Zacatecoluca, ubicado una cuadra abajo de La Curacao
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            2.
                        </Text>
                        <Text style={styles.orderedListItem}>
                        	Cumplir con las clausulas que lo comprometen como USUARIO de los servicios de internet prestados por EL PROVEEDOR que estan suscritas en este contrato.
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            3.
                        </Text>
                        <Text style={styles.orderedListItem}>
                            El Cliente esta en la obligacion de desconectar los equipos de la energia, cuando hayan tormentas electricas, esto debido a que los equipos son sencibles a descargas electricas (Rayos) para evitar que estos se quemen, de no acatar este punto y el equipo se le da??e sera total responsabilidad del CLIENTE reponer el equipo para poder darle continuidad al contrato.
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            4.
                        </Text>
                        <Text style={styles.orderedListItem}>
                        	Cuidar de los equipos instalados en su residencia o lugar de la prestaci??n del servicio de conexion a internet, ya que son <Text style={styles.textValue}>PROPIEDAD DE EL PROVEEDOR.</Text>
                        </Text>
                    </View>
                    <View style={styles.orderedListContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                5.
                            </Text>
                        </Text>
                        <Text style={styles.orderedListItem}>
                            <Text style={styles.textValue}>
                        	    Por ningun motivo el CLIENTE, puede mover de lugar y/o trasladar los equipos a otra residencia, la encargada de traslados es unica y exclusivamente la EMPRESA.
                            </Text>
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        SEXTO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                            PENALIDADES
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            a)
                        </Text>
                        <Text style={styles.sublistItem}>
                            Queda establecido que si por cualquier motivo,&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            &nbsp;decidiera&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>romper ?? cancelar</Text>
                            &nbsp;el presente contrato, el importe equivalente a cancelar sera del&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>50% del tiempo restante estipulado en el contrato.</Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            b)
                        </Text>
                        <Text style={styles.sublistItem}>
                        	En caso que&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            &nbsp;no cancelara en las fechas antes estipuladas, pagar?? un recargo o mora de $3.00 dolares, por cada cuota retrazada.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                c)
                            </Text>
                        </Text>
                        <Text style={styles.sublistItem}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                En caso de que EL CLIENTE se retrazara en el pago mensual El PROVEEDOR realizar?? la suspensi??n de los servicios de internet despues de cinco dias de espera del pago mensual acordado por parte del CLIENTE, contados a partir del dia 3 de cada mes especificamente a partir del dia 8 y podr?? reestablecerlo, hasta que  EL CLIENTE cumpla con el pago mensual + la mora correspondiente.
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                d)
                            </Text>
                        </Text>
                        <Text style={styles.sublistItem}>
                            <Text style={styles.textValue}>
                                En el caso de el periodo en que el cliente est?? desconectado de los servicios de internet por causa de incumplimiento de pago, no ser?? responsabilidad del PROVEEDOR, por lo cual, EL CLIENTE pagar?? normalmente los periodos posteriores, aun si el servicio est?? inactivo por causa de incumplimiento de pago, este seguir?? contando de forma normal las siguientes cuotas.
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            e)
                        </Text>
                        <Text style={styles.sublistItem}>
                        	En caso de perdida o robo del equipo instalado, sera responsabilidad de&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            &nbsp;reponerlo,&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>cancelando $30.00 por el Router Wifi y $ 125.00 por la antena receptora</Text>
                            , teniendo la opci??n de cancelar dicha sumatoria en un solo pago o en cuotas cargadas de forma equitativa entre el total de meses restantes al contrato.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            f)
                        </Text>
                        <Text style={styles.sublistItem}>
                        	En caso que&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            &nbsp;decidiera cambiar de lugar el punto de conexi??n,
                            este cancelar?? un total de $15.00 dolares americanos en concepto de traslado
                            siempre y cuando el&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>PROVEEDOR</Text>
                            &nbsp;brinde cobertura en la nueva zona, en caso que el proveedor no brinde cobretra el contrato sera cancelado automaticamente.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>
                                g)
                            </Text>
                        </Text>
                        <Text style={styles.sublistItem}>
                            <Text style={styles.textValue}>
                                En caso que el cliente mueva o traslade los equipos a otra vivienda,
                                la empresa impondra una multa de $75.00 por matipulacion
                                de dichos equipos sin previo aviso y podr??aa ser suspendido definitivamente en ambas viviendas.
                            </Text>
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        S??PTIMO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            ??
                        </Text>
                        <Text style={styles.listItem}>
                        	TERMINACI??N DEL CONTRATO
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            a)
                        </Text>
                        <Text style={styles.sublistItem}>
                        	Al finalizar las fechas estipuladas de duraci??n del presente contrato, quedar?? a disposici??n del cliente, cancelar el contrato o continuar con los servicios y firmar una nueva contrataci??n de los mismos con el PROVEEDOR para un nuevo periodo.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            b)
                        </Text>
                        <Text style={styles.sublistItem}>
                        	Todo el equipo instalado en la residencia de&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            &nbsp;para la conexi??n a internet inal??mbrica, es propiedad de&nbsp;
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL PROVEEDOR</Text>
                            , por lo tanto en caso de cancelaci??n o finalizaci??n de contrato, EL PROVEEDOR esta en todo el derecho de retirar el equipo que haya sido instalado para la prestaci??n del servicio y el CLIENTE en la obligaci??n de entregarlo.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            c)
                        </Text>
                        <Text style={styles.sublistItem}>
                            <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                            , no podr?? transferir de forma total o parcial las obligaciones que asume en este contrato, y tendr?? responsabilidad directa y exclusiva por el cumplimiento del mismo.
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        OCTAVO
                    </Text>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>

                        </Text>
                        <Text style={styles.sublistItem}>
                            Para los efectos de cualquier comunicaci??n que las partes deseen dirigirse, se??alan como sus domicilios los consignados en la parte introductoria del presente documento, oblig??ndose a notificar la una a la otra, cualquier variaci??n de los mismos, con una anticipaci??n de por lo menos quince (15) d??as h??biles.
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>

                        </Text>
                        <Text style={styles.sublistItem}>
                            Todo litigio o controversia, derivados o relacionados con este contrato, ser?? resuelto mediante tribunales, de conformidad con los Reglamentos de los mismos, a cuyas normas, administraci??n y decisi??n se someten las partes en forma incondicional, declarando conocerlas y aceptarlas en su integridad.
                        </Text>
                    </View>
                    <View style={{ marginVertical: 10, width: '100%' }}></View>
                    <Text style={styles.text}>
                        Ambas partes declaran su conformidad con las cl??usulas que anteceden, suscribiendo el presente documento en
                    </Text>
                    <View style={{ marginVertical: 15, width: '100%' }}></View>
                    <Text style={styles.text}>
                        Zacatecoluca, a los&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>
                            {(contrato.fecha_ingreso.toDate().getDate())}
                        </Text>
                        &nbsp;d??as del mes&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>
                            {verFecha(contrato.fecha_ingreso)}.
                        </Text>
                    </Text>
                </View>
                <View style={styles.signContainer}>
                    <View style={styles.signItem}>
                        <Text>F.___________________________________________</Text>
                        <Text>
                            Proveedor: <Text style={styles.textValue}>[Nombre]</Text>
                        </Text>
                        <Text>
                            DUI: <Text style={styles.textValue}>[DUI]</Text>
                        </Text>
                    </View>
                    <View style={styles.signItem}>
                        <Text>F.___________________________________________</Text>
                        <Text>
                            Cliente: <Text style={styles.textValue}>{contrato.cliente}</Text>
                        </Text>
                        <Text>
                            DUI: <Text style={styles.textValue}>{cliente.dui}</Text>
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default Contrato;
