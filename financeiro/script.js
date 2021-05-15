// DADOS
let Lancamentos = {
    link: 'https://drive.google.com/file/d/1uPBqQ4Cghu74i7bgZZJLPDg3qcvBugI6/view?usp=sharing',
    all: [],
}
// UTILITÁRIO
const Utils = {
    criaData(string) {
        let d = new Date(string)
        return d
    },
    formatData(input) {
        return input.toLocaleString('pt-BR',{ year: 'numeric', month: 'numeric', day: 'numeric' })
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''
        value = String(value).replace(/\D/g,'')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR',{
            style: 'currency',
            currency: 'BRL'
        })
        const currency = signal + value
        return currency
    },
    showHideFormulario(acao) {
        document.querySelectorAll('.novoLancamento input').forEach(elm=>{
            if (elm.type != 'radio'){
                elm.value = ''
            } else {
                elm.checked = false;
            }
        })
        document.querySelectorAll('.novoLancamento').forEach(elm=>{
            elm.style.display = acao
        })
    },
    bindaEventos() {
        let btnNovo = document.querySelector('thead button#novo')
        btnNovo.addEventListener('click',Utils.mostraFormulario)
        let btnGravar = document.querySelector('thead .novoLancamento button')
        btnGravar.addEventListener('click',Utils.gravaFormulario)

        document.getElementById('load').addEventListener('change', Utils.loadJson)
        document.getElementById('download').addEventListener('click', Utils.downloadLancamentos)
    },
    mostraFormulario() {
        Utils.showHideFormulario('')
    },
    gravaFormulario() {
        
        let novoLancamento = {}
        document.querySelectorAll('.novoLancamento input').forEach(elm=>{
            if (elm.type != 'radio'){
                if(elm.id == 'fData'){
                    novoLancamento.data = new Date(elm.value+' 00:00:00')
                }
                if(elm.id == 'fDesc'){
                    novoLancamento.descricao = elm.value
                }
                if(elm.id == 'fValor'){
                    novoLancamento.valor = elm.value
                }
            } else {
                if (elm.checked == true) {
                    novoLancamento.tipo = elm.value
                }
            }
        })
        console.log(novoLancamento)
        Lancamentos.all.push(novoLancamento)
        Utils.showHideFormulario('none')
        App.reload()
    },
    limpaLancamentos() {
        document.querySelectorAll('table tbody tr').forEach(tr => {
            tr.remove()
        })
    },
    printaLancamentos() {
        if (Lancamentos.all.length == 0){
            let lancamentos = JSON.parse(localStorage.getItem('lancamentos'))
            if (lancamentos) {
                lancamentos.forEach(l => {
                    l.data = Utils.criaData(l.data)
                })
                Lancamentos.all = lancamentos
            }
        }
        
        let saldo = 0
        Lancamentos.all.sort((a, b) => (a.data < b.data) ? 1 : -1)
        Lancamentos.all.forEach((lancamento,index) => {
            console.log(lancamento.data)
            console.log(Utils.formatData(lancamento.data))
            let linha = `
            <td>${Utils.formatData(lancamento.data)}</td>
            <td>${lancamento.descricao}</td>
            <td>${lancamento.tipo}</td>
            <td colspan="3">${Utils.formatCurrency(lancamento.valor)}</td>
            `
            let tr = document.createElement('tr')
            tr.innerHTML = linha
            tr.dataset.index = index
            document.querySelector('table tbody').appendChild(tr)
            saldo = saldo + Number(lancamento.valor)
        })
        document.getElementById('saldo').textContent = Utils.formatCurrency(saldo)

        if (Lancamentos.all.length > 0){
            localStorage.setItem('lancamentos', JSON.stringify(Lancamentos.all));
        }
    },
    loadJson(event) {
        var reader = new FileReader();
        reader.onload = Utils.onReaderLoad;
        reader.readAsText(event.target.files[0]);
    },
    onReaderLoad(event) {
        var obj = JSON.parse(event.target.result);
        //console.log(obj)
        obj.forEach(o => {
            o.data = Utils.criaData(o.data)
        })
        Lancamentos.all = obj
        Utils.printaLancamentos()
    },
    downloadLancamentos() {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Lancamentos.all));
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href",     dataStr     );
        let x = new Date()  
        let hash = Date.UTC(x.getDate(),x.getMinutes(),x.getMilliseconds());
        dlAnchorElem.setAttribute("download", `lancamentos${hash}.json`);
        dlAnchorElem.click();
    }
}
// APLICAÇÃO
let App = {
    init() {
        Utils.showHideFormulario('none')
        Utils.bindaEventos()
        Utils.printaLancamentos()
    },
    reload() {
        Utils.limpaLancamentos()
        Utils.printaLancamentos()
    }
}


console.clear()
App.init()
