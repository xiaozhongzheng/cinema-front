<template>
  <div id="cart">
    <div class="cart-container">
      <h2 class="cart-title">购物车</h2>

      <!-- 购物车列表 -->
      <div v-if="cartArr.length !== 0" class="cart-list">
        <el-checkbox-group
          v-model="checkedCartes"
          @change="handleCheckedCitiesChange"
        >
          <div class="cart-item" v-for="cart in cartArr" :key="cart.id">
            <!-- 复选框 -->
            <div class="checkbox-col">
              <el-checkbox :label="cart" :key="cart.id" size="large">
                <br />
              </el-checkbox>
            </div>

            <!-- 海报图片 -->
            <div class="poster-col">
              <img
                :src="cart.poster"
                class="film-poster"
                alt="电影海报"
                loading="lazy"
              />
            </div>

            <!-- 主要信息 -->
            <div class="info-col">
              <p class="film-title">{{ cart.title }}</p>
              <div class="info-row">
                <span class="info-item">放映厅：{{ cart.screenName }}</span>
                <span class="info-item">座位：{{ cart.seatNumber }}号</span>
              </div>
              <div class="info-row">
                <span class="info-item">手机号码：{{ cart.phone }}</span>
              </div>
              <div class="info-row">
                <span class="info-item">开场时间：</span>
                <span class="info-item highlight">{{ cart.startTime }}</span>
              </div>
            </div>

            <!-- 价格和删除按钮 -->
            <div class="action-col">
              <span class="price">￥ {{ cart.price }}</span>
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="deleteCartById(cart.id)"
                size="small"
                circle
                class="delete-btn"
              ></el-button>
            </div>
          </div>
        </el-checkbox-group>

        <!-- 结算栏 -->
        <div class="checkout-bar">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange"
            class="check-all"
            size="large"
            >全选</el-checkbox
          >

          <div class="price-info">
            <span class="total-price"
              >总价：
              <span class="price-value">￥{{ countPrice }}</span>
            </span>
            <span class="discount-price"
              >优惠价：
              <span class="price-value highlight-price"
                >￥{{ discountPrice }}</span
              >
            </span>
          </div>

          <el-button
            type="success"
            class="checkout-btn"
            @click="open"
            size="large"
          >
            结算
          </el-button>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <el-empty
          :image-size="200"
          description="这里空空如也，快去选购心仪的电影票吧～"
        ></el-empty>
        <el-button
          type="primary"
          class="go-shopping-btn"
          @click="$router.push('/film')"
        >
          去购票
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserStore } from "@/stores";
import { getCartes, deleteCartById } from "@/api/cart";
import { saveOrders } from "@/api/orders";

// ========== 类型定义 ==========
interface CartItem {
  id: number;
  title: string;
  poster: string;
  screenName: string;
  seatNumber: number;
  phone: string;
  startTime: string;
  price: number;
  scheduleId: number;
}

interface OrderItem {
  cartId: number;
  name: string;
  poster: string;
  scheduleId: number;
  seatNumber: number;
  amount: string;
  startTime: string;
}

// ========== 响应式变量 ==========
const checkAll = ref(false);
const checkedCartes = ref<CartItem[]>([]);
const isIndeterminate = ref(false);
const cartArr = ref<CartItem[]>([]);
const countPrice = ref(0); // 总价格
const discount = ref(1); // 折扣
const discountPrice = ref(0); // 折扣后价格

// 获取用户仓库
const userStore = useUserStore();

// ========== 生命周期 ==========
onMounted(async () => {
  await getCartesByUserId();
  // 获取用户折扣
  discount.value = userStore.userInfo?.discount || 1;
});

// ========== 方法定义 ==========
/** 获取用户购物车列表 */
const getCartesByUserId = async () => {
  try {
    const res = await getCartes();
    cartArr.value = res || [];
  } catch (err) {
    ElMessage.error("获取购物车失败");
    console.error(err);
  }
};

/** 全选/取消全选 */
const handleCheckAllChange = (val: boolean) => {
  checkedCartes.value = val ? [...cartArr.value] : [];
  isIndeterminate.value = false;

  if (val) {
    countPrice.value = computeCartCountPrice(cartArr.value);
  } else {
    countPrice.value = 0;
  }
  // 计算折扣价
  discountPrice.value = Number((countPrice.value * discount.value).toFixed(2));
};

/** 单个复选框变更 */
const handleCheckedCitiesChange = (value: CartItem[]) => {
  countPrice.value = computeCartCountPrice(value);
  discountPrice.value = Number((countPrice.value * discount.value).toFixed(2));

  const checkedCount = value.length;
  checkAll.value = checkedCount === cartArr.value.length;
  isIndeterminate.value =
    checkedCount > 0 && checkedCount < cartArr.value.length;
};

/** 计算选中商品总价 */
const computeCartCountPrice = (arr: CartItem[]) => {
  return arr.reduce((total, item) => total + item.price, 0);
};

/** 删除购物车项 */
const deleteCartById = async (id: number) => {
  try {
    await deleteCartById(id);
    ElMessage.success("删除成功");
    await getCartesByUserId(); // 重新获取购物车列表
  } catch (err) {
    ElMessage.error("删除失败");
    console.error(err);
  }
};

/** 结算确认 */
const open = async () => {
  if (countPrice.value === 0) {
    ElMessage.error("结算的金额不能是0");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `请您确认订单的金额为${discountPrice.value}元, 是否支付?`,
      "提示",
      {
        confirmButtonText: "确认支付",
        cancelButtonText: "取消支付",
        type: "warning",
      },
    );
    await saveOrdersHandler();
  } catch {
    ElMessage.info("取消支付");
  }
};

/** 保存订单 */
const saveOrdersHandler = async () => {
  try {
    const ordersArr = getHandleOrdersArr.value;
    await saveOrders(ordersArr);
    ElMessage.success("支付成功");
    await getCartesByUserId(); // 重新获取购物车列表
    // 清空选中状态
    checkAll.value = false;
    checkedCartes.value = [];
    countPrice.value = 0;
    discountPrice.value = 0;
  } catch (err) {
    ElMessage.error("支付失败");
    console.error(err);
  }
};

// ========== 计算属性 ==========
/** 转换购物车数据为订单数据 */
const getHandleOrdersArr = computed<OrderItem[]>(() => {
  return checkedCartes.value.map((item) => ({
    cartId: item.id,
    name: item.title,
    poster: item.poster,
    scheduleId: item.scheduleId,
    seatNumber: item.seatNumber,
    amount: item.price.toFixed(2),
    startTime: item.startTime,
  }));
});
</script>

<style lang="scss" scoped>
// 全局基础样式
#cart {
  text-align: left;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

  .cart-container {
    width: 95%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 0;

    .cart-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #212529;
      position: relative;
      padding-bottom: 12px;

      &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 60px;
        height: 3px;
        background-color: #409eff;
        border-radius: 2px;
      }
    }

    // 购物车列表
    .cart-list {
      // 购物车项
      .cart-item {
        width: 100%;
        height: 140px;
        background-color: #fff;
        border: 1px solid #e9ecef;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);

          .film-poster {
            transform: scale(1.02);
          }
        }

        // 复选框列
        .checkbox-col {
          width: 6%;
          text-align: center;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        // 海报列
        .poster-col {
          height: 100%;
          margin-right: 24px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

          .film-poster {
            height: 100%;
            width: auto;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
        }

        // 信息列
        .info-col {
          width: 60%;
          height: 100%;
          margin: 0 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;

          .film-title {
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 18px;
            color: #212529;
            // white-space: nowrap;
            // overflow: hidden;
            // text-overflow: ellipsis;
          }

          .info-row {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 6px;

            .info-item {
              font-size: 14px;
              color: #495057;
              margin-right: 24px;
              line-height: 1.8;

              &.highlight {
                color: #e74c3c;
                font-weight: 500;
              }
            }
          }
        }

        // 操作列
        .action-col {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
          padding-right: 8px;

          .price {
            font-size: 18px;
            color: #e74c3c;
            font-weight: 700;
            width: 120px;
            display: inline-block;
            text-align: right;
          }

          .delete-btn {
            width: 36px;
            height: 36px;
            opacity: 0.7;
            transition:
              opacity 0.2s ease,
              background-color 0.2s ease;

            &:hover {
              opacity: 1;
              background-color: #dc3545;
            }
          }
        }
      }

      // 结算栏
      .checkout-bar {
        width: 100%;
        height: 90px;
        background-color: #f8f9fa; // 浅灰白底色（替代原深灰）
        border: 1px solid #e9ecef; // 增加边框，提升质感
        border-radius: 12px;
        margin-top: 24px;
        display: flex;
        align-items: center;
        padding: 0 30px;
        box-sizing: border-box;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); // 更柔和的阴影

        .check-all {
          color: #212529; // 深灰文字（替代原白色）
          font-size: 16px;
          font-weight: 500;
        }

        .price-info {
          margin-left: auto;
          display: flex;
          gap: 40px;
          color: #495057; // 中灰文字（替代原浅灰）
          font-size: 16px;

          .total-price,
          .discount-price {
            .price-value {
              font-size: 22px;
              font-weight: 700;
              width: 120px;
              display: inline-block;
              text-align: right;
              color: #212529; // 深灰价格（替代原白色）

              &.highlight-price {
                color: #409eff; // 蓝色突出优惠价（替代原金色）
              }
            }
          }
        }

        .checkout-btn {
          margin-left: 30px;
          padding: 12px 36px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          background-color: #409eff; // 蓝色按钮（替代原绿色）
          border: none;
          transition:
            background-color 0.2s ease,
            transform 0.1s ease;

          &:hover {
            background-color: #3393ff; // 加深蓝色hover
            transform: scale(1.02);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }

    // 空购物车
    .empty-cart {
      text-align: center;
      padding: 80px 0;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      margin-top: 20px;

      .go-shopping-btn {
        margin-top: 30px;
        padding: 12px 40px;
        font-size: 16px;
        border-radius: 8px;
        background-color: #409eff;
        border: none;

        &:hover {
          background-color: #3393ff;
        }
      }
    }
  }
}

// 重置默认样式
p {
  margin: 0;
  padding: 0;
}
</style>
