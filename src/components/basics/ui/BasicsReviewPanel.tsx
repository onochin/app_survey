import type { BasicsLearningRecordMap } from "../learningRecordTypes";
import {
  basicsLearningItems,
  createEmptyBasicsLearningRecord,
  getBasicsLearningDomSuffix,
  hasBasicsLearningActivity,
} from "../utils/learningRecords";
import { formatBasicsLearningUpdatedAt } from "./BasicsLearningRecordEditor";

interface BasicsReviewPanelProps {
  readonly records: BasicsLearningRecordMap;
  readonly onOpenItem: (itemId: string) => void;
}

function BasicsReviewPanel({
  records,
  onOpenItem,
}: BasicsReviewPanelProps) {
  const understoodCount = basicsLearningItems.filter(
    (item) => records[item.id]?.isUnderstood,
  ).length;
  const reviewCount = basicsLearningItems.filter(
    (item) => records[item.id]?.needsReview,
  ).length;
  const recordedItems = basicsLearningItems
    .filter((item) =>
      hasBasicsLearningActivity(
        records[item.id] ?? createEmptyBasicsLearningRecord(),
      ),
    )
    .sort((left, right) => {
      const leftNeedsReview = records[left.id]?.needsReview ? 1 : 0;
      const rightNeedsReview = records[right.id]?.needsReview ? 1 : 0;

      return rightNeedsReview - leftNeedsReview;
    });

  return (
    <section
      aria-labelledby="basics-learning-review-title"
      className="basics-learning-review-panel"
      data-testid="basics-learning-review-panel"
      id="basics-learning-review-panel"
    >
      <header className="basics-learning-review-heading">
        <div>
          <span>REVIEW LIST</span>
          <h2 id="basics-learning-review-title">基礎教材の復習一覧</h2>
          <p>
            第1章～第9章と15問の記録を分けて管理し、「あとで復習」の項目を上に表示します。
          </p>
        </div>
        <dl>
          <div>
            <dt>理解できた</dt>
            <dd>{understoodCount} / {basicsLearningItems.length}項目</dd>
          </div>
          <div>
            <dt>あとで復習</dt>
            <dd>{reviewCount}項目</dd>
          </div>
          <div>
            <dt>記録あり</dt>
            <dd>{recordedItems.length}項目</dd>
          </div>
        </dl>
      </header>

      {recordedItems.length === 0 ? (
        <div className="basics-learning-review-empty">
          <strong>学習記録はまだありません</strong>
          <p>
            章または確認問題の「理解できた」「あとで復習」、メモ、学習回数を記録すると、ここへ表示されます。
          </p>
        </div>
      ) : (
        <ol className="basics-learning-review-list">
          {recordedItems.map((item) => {
            const record =
              records[item.id] ?? createEmptyBasicsLearningRecord();
            const domSuffix = getBasicsLearningDomSuffix(item.id);

            return (
              <li
                className={record.needsReview ? "needs-review" : ""}
                data-item-id={item.id}
                data-testid={`basics-learning-review-item-${domSuffix}`}
                key={item.id}
              >
                <div className="basics-learning-review-item-heading">
                  <div>
                    <span>
                      第{Number(item.lessonNumber)}章・
                      {item.kind === "lesson" ? "章" : "確認問題"}
                    </span>
                    <small>{item.lessonTitle}</small>
                    <h3>{item.title}</h3>
                  </div>
                  {record.needsReview ? <strong>要復習</strong> : null}
                </div>

                <dl className="basics-learning-review-status">
                  <div>
                    <dt>理解状態</dt>
                    <dd>{record.isUnderstood ? "理解済み" : "学習中"}</dd>
                  </div>
                  <div>
                    <dt>復習状態</dt>
                    <dd>{record.needsReview ? "あとで復習" : "復習指定なし"}</dd>
                  </div>
                  <div>
                    <dt>学習回数</dt>
                    <dd>{record.practiceCount}回</dd>
                  </div>
                  <div>
                    <dt>最終記録</dt>
                    <dd>{formatBasicsLearningUpdatedAt(record.updatedAt)}</dd>
                  </div>
                </dl>

                {record.note.trim().length > 0 ? (
                  <p className="basics-learning-review-note">
                    <strong>メモ</strong>
                    {record.note}
                  </p>
                ) : (
                  <p className="basics-learning-review-no-note">
                    メモはありません。
                  </p>
                )}

                <button onClick={() => onOpenItem(item.id)} type="button">
                  {item.kind === "lesson" ? "この章を開く" : "この問題を開く"}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default BasicsReviewPanel;
