import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initialMenus } from "../data/menu-hamburger";
import { calculateTotal, flattenOptions } from "../utils/price";
import styles from "./POSPage.module.css";

export default function POSPage() {
  const [cart, setCart] = useState([]);
  const [orderNumber, setOrderNumber] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [cashReceived, setCashReceived] = useState(0);

  const [receiptOrder, setReceiptOrder] = useState(null);

  const burgerMenus = initialMenus.filter((menu) => menu.category === "burger");
  const sideMenus = initialMenus.filter((menu) => menu.category === "side");
  const drinkMenus = initialMenus.filter((menu) => menu.category === "drink");

  // 各商品を選んだ時にモーダルが開く関数（オプション・個数を初期化）
  const openMenuModal = (item) => {
    setSelectedProduct(item);
    setQuantity(1);

    // デフォルトのオプション選択初期化（それぞれのグループの最初の選択肢を選ぶなど）
    const initialOpts = {};

    if (item.options) {
      item.options.forEach((group) => {
        // singleとmultipleがある
        // singleの場合
        if (group.type === "single" && group.choices.length > 0) {
          // 一番最初の選択肢
          initialOpts[group.groupId] = group.choices[0];
        } else if (group.type === "multiple") {
          // multipleの場合は空に
          initialOpts[group.groupId] = [];
        }
      });
    }
    setSelectedOptions(initialOpts);
  };

  // オプションを変更した時の処理
  const handleOptionChange = (groupId, choice, type) => {
    if (type === "single") {
      setSelectedOptions({
        ...selectedOptions,
        [groupId]: choice,
      });
    } else if (type === "multiple") {
      const currentChoices = selectedOptions[groupId] || [];
      const exists = currentChoices.some((c) => c.label === choice.label);
      if (exists) {
        setSelectedOptions({
          ...selectedOptions,
          [groupId]: currentChoices.filter((c) => c.label !== choice.label),
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [groupId]: [...currentChoices, choice],
        });
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);

    const product = initialMenus.find((menu) => menu.id === item.productId);

    setSelectedProduct(product);

    const options = {};

    product?.options?.forEach((group) => {
      const savedOptions = item.selectedOptions || [];

      if (group.type === "single") {
        options[group.groupId] =
          savedOptions.find((option) =>
            group.choices.some((choice) => choice.label === option.label),
          ) || group.choices[0];
      } else {
        options[group.groupId] = savedOptions.filter((option) =>
          group.choices.some((choice) => choice.label === option.label),
        );
      }
    });
    console.log(options);

    setSelectedOptions(options);
    setQuantity(item.quantity);
  };

  // カートに追加する関数(新規追加モーダルと編集モーダルから）
  const handleAddToCartFromModal = () => {
    const optList = flattenOptions(selectedOptions);

    // 商品ごとの合計
    const itemTotalPrice = calculateTotal(selectedProduct, optList, quantity);

    const optionLabels = optList
      .map((opt) => opt.label)
      .filter((label) => label !== "通常");

    const kitchenDisplayString = [
      selectedProduct.shortName,
      ...optionLabels,
    ].join("　");
    // 編集ならば
    if (editingItemId !== null) {
      // 量がゼロならば
      if (quantity === 0) {
        setCart((prevCart) =>
          prevCart.filter((item) => item.id !== editingItemId),
        );

        setSelectedProduct(null);
        setEditingItemId(null);
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                quantity,
                // priceは商品一個の値段（オプション込み）、totalPriceは商品全体の値段（×数量込み）
                price: calculateTotal(selectedProduct, optList, 1),
                totalPrice: itemTotalPrice,
                selectedOptions: optList,
                optionLabels,
                kitchenDisplayString,
              }
            : item,
        ),
      );
    } else {
      // 新規追加ならば
      if (!selectedProduct) return;

      const cartItem = {
        id: crypto.randomUUID(),
        productId: selectedProduct.id,
        name: selectedProduct.name,
        shortName: selectedProduct.shortName,
        imageUrl: selectedProduct.imageUrl,
        price: selectedProduct.price,
        selectedOptions: optList,
        optionLabels,
        kitchenDisplayString,
        quantity,
        totalPrice: itemTotalPrice,
      };

      setCart((prevCart) => [...prevCart, cartItem]);
    }

    setSelectedProduct(null);
    setEditingItemId(null);
  };

  // 注文完了する関数
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        selectedOptions: item.selectedOptions,
        optionLabels: item.optionLabels,
        kitchenDisplayString: item.kitchenDisplayString,
        isCompleted: false,
      }));

      const orderTotalPrice = cart.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );

      const orderNumber = Math.floor(Math.random() * 900) + 100;

      const newOrder = {
        // seatNumber: seatNumber,
        items: orderItems,
        totalPrice: orderTotalPrice,
        cashReceived,
        changeAmount: cashReceived - orderTotalPrice,
        status: "pending",
        orderNumber,
        createdAt: serverTimestamp(),
      };

      // Firestoreに注文を保存
      await addDoc(collection(db, "orders"), newOrder);

      // 保存成功後にレシートを表示
      setReceiptOrder({
        ...newOrder,
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("注文処理エラー:", e);
      console.error("エラーコード:", e.code);
      console.error("エラー内容:", e.message);
      alert(`注文に失敗しました: ${e.message}`);
    }
  };

  // カート内の合計個数
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // カート内の合計金額
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // モーダル内で選ばれているオプションと個数から、現在の合計金額を計算する
  const calculateModalTotalPrice = () => {
    if (!selectedProduct) return 0;

    const optList = flattenOptions(selectedOptions);

    return calculateTotal(selectedProduct, optList, quantity);
  };

  const currentTotalPrice = calculateModalTotalPrice();

  // 電卓の数字入力
  const handleCashNumber = (number) => {
    setCashInput((prev) => prev + number);
  };

  // 1文字削除
  const handleCashDelete = () => {
    setCashInput((prev) => prev.slice(0, -1));
  };

  // お預かり金額を確定
  const handleCashConfirm = () => {
    const amount = Number(cashInput);

    if (!cashInput || amount < cartTotalPrice) {
      alert("合計金額以上の金額を入力してください。");
      return;
    }

    setCashReceived(amount);
    setIsCashModalOpen(false);
  };

  // おつり
  const changeAmount = Math.max(0, cashReceived - cartTotalPrice);

  return (
    <>
      <div className={styles.app}>
        {/* 左側 */}
        <div className={styles.posOrderPanel}>
          <h2>ご注文</h2>
          {cart.map((item) => (
            <div className={styles.posOrderItem} key={item.id}>
              <div className={styles.posOrderInfo}>
                <span className={styles.posOrderName}>
                  {item.name}
                  {item.kitchenDisplayString}
                </span>
                <span className={styles.posOrderPrice}>
                  ¥{item.totalPrice.toLocaleString()}
                </span>
              </div>

              <span className={styles.posOrderQuantity}>× {item.quantity}</span>

              <button
                className={styles.posOrderEdit}
                onClick={() => handleEditItem(item)}
              >
                変更
              </button>
            </div>
          ))}
          {/* 合計 */}
          <div className={styles.posOrderTotal}>
            <span>合計（{totalItemCount}点）</span>
            <span>¥{cartTotalPrice.toLocaleString()}</span>
          </div>

          {/* お預かり */}
          <div className={styles.posOrderTotal}>
            <span>お預かり</span>

            <button
              type="button"
              onClick={() => {
                setCashInput(cashReceived > 0 ? String(cashReceived) : "");
                setIsCashModalOpen(true);
              }}
            >
              金額を入力
            </button>

            <span>¥{cashReceived.toLocaleString()}</span>
          </div>

          {/* おつり */}
          <div className={styles.posOrderTotal}>
            <span>おつり</span>
            <span>¥{changeAmount.toLocaleString()}</span>
          </div>

          {/* 注文確定 */}
          <button
            type="button"
            className={styles.posCheckoutBtn}
            onClick={handleCheckout}
            disabled={cashReceived < cartTotalPrice}
          >
            注文確定
          </button>
        </div>

        {/* 右側 */}
        <div className={styles.posProductPanel}>
          <h2>商品パネル</h2>
          <div className={styles.productArea}>
            <div className={styles.burgerPanel}>
              {burgerMenus.map((burger) => (
                <div
                  className={styles.productPanel}
                  key={burger.id}
                  onClick={() => openMenuModal(burger)}
                >
                  <span className={styles.buttonLabel}>
                    {burger.buttonLabel}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.sidePanel}>
              {sideMenus.map((side) => (
                <div
                  className={styles.productPanel}
                  key={side.id}
                  onClick={() => openMenuModal(side)}
                >
                  <span className={styles.buttonLabel}>{side.buttonLabel}</span>
                </div>
              ))}
            </div>

            <div className={styles.drinkPanel}>
              {drinkMenus.map((drink) => (
                <div
                  className={styles.productPanel}
                  key={drink.id}
                  onClick={() => openMenuModal(drink)}
                >
                  <span className={styles.buttonLabel}>
                    {drink.buttonLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      //! 商品オプション選択モーダル
      {selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedProduct.name}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedProduct(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className={styles.modalThumbnail}
              />
              <p className={styles.modalBasePrice}>
                基準価格: ¥{selectedProduct.price}
              </p>

              {/* オプション選択ループ */}
              {selectedProduct.options &&
                selectedProduct.options.map((group) => (
                  <div
                    key={group.groupId}
                    className={styles.optionGroupSection}
                  >
                    {/* 選択タイトル*/}
                    <h4 className={styles.optionGroupTitle}>
                      {group.groupName}
                    </h4>
                    <div className={styles.optionButtonContainer}>
                      {group.choices.map((choice) => {
                        const isSelected =
                          group.type === "single"
                            ? selectedOptions[group.groupId]?.label ===
                              choice.label
                            : (selectedOptions[group.groupId] || []).some(
                                (c) => c.label === choice.label,
                              );
                        return (
                          // 選択肢ボタン
                          <button
                            key={choice.label}
                            type="button"
                            onClick={() =>
                              handleOptionChange(
                                group.groupId,
                                choice,
                                group.type,
                              )
                            }
                            className={
                              isSelected
                                ? styles.optionBtnSelected
                                : styles.optionBtn
                            }
                          >
                            {choice.label} {/* 追加料金があれば表示 */}
                            {choice.price > 0 ? `(+¥${choice.price})` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              {/* 個数選択 */}
              <div className={styles.quantitySection}>
                <span className={styles.quantityLabel}>個数</span>
                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        editingItemId !== null
                          ? Math.max(0, quantity - 1)
                          : Math.max(1, quantity - 1),
                      )
                    }
                    className={styles.quantityBtn}
                  >
                    -
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={handleAddToCartFromModal}
                className={styles.addToCartModalBtn}
              >
                <span>カートに追加する</span>
                <span className={styles.totalPrice}>
                  ¥{currentTotalPrice.toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      //! お預かり金の入力モーダル
      {isCashModalOpen && (
        <div className={styles.cashModalOverlay}>
          <div className={styles.cashModal}>
            <h2>お預かり金額</h2>

            <div className={styles.cashDisplay}>
              ¥{Number(cashInput || 0).toLocaleString()}
            </div>

            <div className={styles.cashKeypad}>
              {["7", "8", "9", "4", "5", "6", "1", "2", "3", "×", "0"].map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      key === "×" ? handleCashDelete() : handleCashNumber(key)
                    }
                  >
                    {key}
                  </button>
                ),
              )}

              <button
                type="button"
                className={styles.cashConfirmBtn}
                onClick={handleCashConfirm}
              >
                入力
              </button>
            </div>

            <button
              type="button"
              className={styles.cashCancelBtn}
              onClick={() => setIsCashModalOpen(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      //! レシートモーダル
      {receiptOrder && (
        <div className={styles.receiptOverlay}>
          <div className={styles.receiptModal}>
            <h2>注文完了</h2>
            <p className={styles.receiptMessage}>ご注文ありがとうございます</p>

            <div className={styles.receiptNumber}>
              注文番号
              <strong>{receiptOrder.orderNumber}</strong>
            </div>

            <div className={styles.receiptDivider} />

            <div className={styles.receiptItems}>
              {receiptOrder.items.map((item, index) => (
                <div
                  className={styles.receiptItem}
                  key={`${item.productId}-${index}`}
                >
                  <div>
                    <span>{item.name}</span>
                    <span> × {item.quantity}</span>

                    {item.kitchenDisplayString &&
                      item.kitchenDisplayString !== item.name && (
                        <p className={styles.receiptOptions}>
                          {item.kitchenDisplayString}
                        </p>
                      )}
                  </div>

                  <span>¥{item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.receiptDivider} />

            <div className={styles.receiptRow}>
              <span>合計</span>
              <strong>¥{receiptOrder.totalPrice.toLocaleString()}</strong>
            </div>

            <div className={styles.receiptRow}>
              <span>お預かり（現金）</span>
              <span>¥{receiptOrder.cashReceived.toLocaleString()}</span>
            </div>

            <div className={styles.receiptRow}>
              <span>おつり</span>
              <strong>¥{receiptOrder.changeAmount.toLocaleString()}</strong>
            </div>

            <p className={styles.receiptDate}>
              {receiptOrder.createdAt.toLocaleString("ja-JP")}
            </p>

            <button
              type="button"
              className={styles.receiptCloseBtn}
              onClick={() => {
                setReceiptOrder(null);
                setCart([]);
                setCashInput("");
                setCashReceived(0);
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
