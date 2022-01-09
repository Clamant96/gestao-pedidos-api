import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { Categoria } from '../model/Categoria';
import { ListaDeDesejos } from '../model/ListaDeDesejos';
import { Produto } from '../model/Produto';
import { AlertasService } from '../service/alertas.service';
import { CategoriaService } from '../service/categoria.service';
import { ProdutoService } from '../service/produto.service';

@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.css']
})
export class ProdutoComponent implements OnInit {

  produto: Produto = new Produto();
  listaDeProdutos: Produto[];
  listaDeProdutosFiltrados: Produto[];
  idListaDeDesejos = environment.listaDeDesejos;
  idPedido = environment.pedidos;
  categoriaSelecao: string;

  categoria: Categoria = new Categoria();
  listaDeCategoria: Categoria[];
  idCategoria: number;

  listaDeDesejos: ListaDeDesejos = new ListaDeDesejos();

  estadoAtualProdutos: number;

  constructor(
    private produtoService: ProdutoService,
    private router: Router,
    private categoriaService: CategoriaService,
    private alertas: AlertasService

  ) { }

  ngOnInit() {
    /*if(environment.token == '') {
      this.router.navigate(['/login']);

    }*/

    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);

    }

    this.findAllByProdutos();
    this.findAllByCategoria();

    this.estadoAtualProdutos = 0;

  }

  /* TRAZ TODOS OS PRODUTOS CADASTRADOS NA BASE DE DADOS */
  findAllByProdutos() {
    this.produtoService.findAllByProdutos().subscribe((resp: Produto[]) => {
      this.listaDeProdutos = resp;

    })

  }

  findAllByCategoria() {
    this.categoriaService.findAllCategorias().subscribe((resp: Categoria[]) => {
      this.listaDeCategoria = resp;

      this.categoriaSelecao = resp[0].nome; // INICIALIZA A VARIAVEL

    })

    setTimeout(() => {
      this.selecaoCategoria();
    }, 500);

  }

  /* TRAZ SOMENTE UM UNICO PRODUTO POR MEIO DE SEUS ID */
  findByIdProduto(id: number) {
    this.produtoService.findByIdProduto(id).subscribe((resp: Produto) => {
      this.produto = resp;

    })

  }

  /* TRAZ SOMENTE UM UNICO CATEGORI POR MEIO DE SEUS ID */
  findByIdCategoria() {
    this.categoriaService.fintByIdCategoria(this.idCategoria).subscribe((resp: Categoria) => {
      this.categoria = resp;

    })

  }

  /* TRAZ UM ARRAY DE PRODUTOS POR MEIO DE UMA QUERY DE NOME */
  findAllByNomeProdutos(nome: string) {
    this.produtoService.findAllByNomeProdutos(nome).subscribe((resp: Produto[]) => {
      this.listaDeProdutos = resp;

    })

  }

  /* INSERE NA BASE DE DADOS UM NOVO PRODUTO */
  postProduto() {
    this.categoria.id = this.idCategoria;
    this.produto.categoria = this.categoria;

    this.produtoService.postProduto(this.produto).subscribe((resp: Produto) => {
      this.produto = resp;

      this.alertas.alertaMensagem('Produto adicionado com sucesso!');

      this.produto = new Produto();
      this.findAllByProdutos();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`)

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`)

      }

    })

  }

  /* ATUALIZA UM PRODUTO JA EXISTENTE NA BASE DE DADOS */
  putProduto() {
    this.categoria.id = this.idCategoria;
    this.produto.categoria = this.categoria;

    this.produtoService.putProduto(this.produto).subscribe((resp: Produto) => {
      this.produto = resp;

      this.alertas.alertaMensagem('Produto atualizado com sucesso!');

      this.produto = new Produto();
      this.findAllByProdutos();

    }, erro => {
      if(erro.status == 500) {
        console.log(`Erro: ${erro.status}, algum dado esta sendo inserido incorretamente.`)

      }else if(erro.status >= 400 && erro.status < 500){
        console.log(`Erro: ${erro.status}, acesso nao autorizado, verifique seu login.`)

      }

    })

  }

  /* ADICIONA PRODUTOS A LISTA DE DESEJOS DO USUARIO */
  adicionaItemListaDeDesejos(idProduto: number, idLista: number) {
    this.produtoService.adicionaItemListaDeDesejos(idProduto, idLista).subscribe(() => {
      this.alertas.alertaMensagem('Produto adicionado a lista de desejos!');

      this.findAllByProdutos();

    })

  }

  /* ADICIONA PRODUTOS AO CARRINHO DO USUARIO */
  adicionaItemCarrinho(idProduto: number, idCarrinho: number) {
    this.produtoService.adicionaItemCarrinho(idProduto, idCarrinho).subscribe(() => {
      this.alertas.alertaMensagem('Produto adicionado ao carrinho!');

      this.findAllByProdutos();

    })

  }

  /* EXCLUI DA BASE DE DADOS UM PRODUTO JA EXISTENTE */
  deleteProduto(id: number) {
    this.produtoService.deleteProduto(id).subscribe(() => {
      this.alertas.alertaMensagem('Produto deleteado com sucesso!');

      this.findAllByProdutos();
    })

  }

  /* PEMISSAO DE ADMINISTRADOR */
  adm (){
    let permissao = false;

    if(environment.tipo == 'adm') {
      permissao = true;

    }

    return permissao;

  }

  /* SELECIONA UMA CATEGOGIA */
  selecaoCategoria() {
    this.listaDeProdutosFiltrados = [new Produto()]; // ZERA A VARIAVIEL

    var array = [new Produto()]; // CRIA UM NOVO OBJETO ARRAY PARA ARMAZER OS DADOS FILTRADOS

    array = array.splice(1, 1);

    console.log('INICIALIZACAO: ');
    console.log(array);

    // INSERE OS PRODITO DE ACORDO COM A SELECAO FEITA EM SELECAO DE CATEGORIA
    this.listaDeProdutos.map(produto => {
      if(this.categoriaSelecao == produto.categoria.nome) {
        array.push(produto);

      }

    });

    this.listaDeProdutosFiltrados = array;

    console.log('PRODUTOS FILTRADOS: ');
    console.log(this.listaDeProdutosFiltrados);

    if(this.listaDeProdutosFiltrados.length > 0) {
      this.estadoAtualProdutos = 1;

    }else {
      this.estadoAtualProdutos = 0;

    }

  }

}
