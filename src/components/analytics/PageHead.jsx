import { Ic } from '../ui/Icons'

export default function PageHead({ day }) {
  return (
    <div className="content" style={{paddingBottom: 0}}>
      <div className="an-head">
        <div>
          <h1>분석</h1>
          <p>매장 고객 행동에서 어떤 패턴이 발견되는지 깊이 있게 살펴보세요. · Vision AI 익명 집계 데이터</p>
        </div>
        <div className="right">
          <button className="btn-secondary"><Ic.Download/> 내보내기</button>
        </div>
      </div>
    </div>
  )
}
