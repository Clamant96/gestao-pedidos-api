import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Produto } from '../model/Produto';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {

  endereco = environment.server + environment.port;

  autorizacao = {
    headers: new HttpHeaders().set('Authorization', environment.token)

  }

  constructor(
    private http: HttpClient

  ) { }

  findAllByProdutos(): Observable<Produto[]> {

    return this.http.get<Produto[]>(`${this.endereco}/produtos`, this.autorizacao);
  }

  findByIdProduto(id: number): Observable<Produto> {

    return this.http.get<Produto>(`${this.endereco}/produtos${id}`, this.autorizacao);
  }

  findAllByNomeProdutos(nome: string): Observable<Produto[]> {

    return this.http.get<Produto[]>(`${this.endereco}/produtos/nome/${nome}`, this.autorizacao);
  }

  postProduto(produto: Produto): Observable<Produto> {

    return this.http.post<Produto>(`${this.endereco}/produtos`, produto, this.autorizacao);
  }

  putProduto(produto: Produto): Observable<Produto> {

    return this.http.put<Produto>(`${this.endereco}/produtos`, produto, this.autorizacao);
  }

  deleteProduto(id: number): Observable<Produto> {

    return this.http.delete<Produto>(`${this.endereco}/produtos/${id}`, this.autorizacao);
  }

}